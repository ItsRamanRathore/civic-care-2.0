import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * A wrapper component for routes that require authentication.
 * It also supports optional role-based access control.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm font-medium text-text-secondary animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if the user has the required permission
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // For admins/department staff, they might be logged in but trying to access the wrong dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
