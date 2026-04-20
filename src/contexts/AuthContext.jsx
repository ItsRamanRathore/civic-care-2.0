import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../lib/apiClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('civic_care_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('civic_care_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, data } = response.data;
      localStorage.setItem('civic_care_token', accessToken);
      setUser(data.user);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error.response?.data || { message: 'Network error. Please try again.' } };
    }
  };

  const signUp = async (userData) => {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      const { accessToken, data } = response.data;
      localStorage.setItem('civic_care_token', accessToken);
      setUser(data.user);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error.response?.data || { message: 'Network error. Please try again.' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('civic_care_token');
    setUser(null);
    return { error: null };
  };

  const updateProfile = async (updates) => {
    try {
      const response = await apiClient.patch('/auth/updateMe', updates);
      setUser(response.data.data.user);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error: error.response?.data || { message: 'Network error. Please try again.' } };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
