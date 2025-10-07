import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/AppIcon';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      // Get user role from metadata or profile and redirect accordingly
      const userRole = user?.user_metadata?.role;
      if (userRole === 'admin' || userRole === 'department_manager') {
        navigate('/admin-dashboard');
      } else {
        navigate('/citizen-dashboard');
      }
    }
  }, [user, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (authError) {
      setAuthError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email?.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (!formData?.password?.trim()) {
      newErrors.password = t('passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setAuthError('');

    try {
      const { data, error } = await signIn(formData?.email, formData?.password);
      
      if (error) {
        if (error?.message?.includes('Invalid login credentials') ||
            error?.message?.includes('Email not confirmed') ||
            error?.message?.includes('Invalid email or password')) {
          setAuthError(t('invalidCredentials'));
        } else if (error?.message?.includes('Failed to fetch') ||
                   error?.message?.includes('AuthRetryableFetchError')) {
          setAuthError(t('connectionError'));
        } else {
          setAuthError(error?.message || t('signinError'));
        }
      } else if (data?.user) {
        // Redirect based on user role
        const userRole = data?.user?.user_metadata?.role;
        if (userRole === 'admin' || userRole === 'department_manager') {
          navigate('/admin-dashboard');
        } else {
          navigate('/citizen-dashboard');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (email, password) => {
    setFormData({ email, password });
    setAuthError('');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="LogIn" size={24} color="white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{t('signIn')}</h1>
            <p className="text-muted-foreground">
              {t('welcomeBack')} {t('signInMessage')}
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-3">{t('demoAccounts')}</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin('admin@civic.gov', 'admin123')}
                className="w-full text-left p-2 bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 transition-colors"
              >
                <div className="text-sm">
                  <div className="font-medium text-blue-800">{t('adminAccount')}</div>
                  <div className="text-blue-600">admin@civic.gov / admin123</div>
                </div>
              </button>
              <button
                onClick={() => handleDemoLogin('citizen@example.com', 'citizen123')}
                className="w-full text-left p-2 bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 transition-colors"
              >
                <div className="text-sm">
                  <div className="font-medium text-blue-800">{t('citizenAccount')}</div>
                  <div className="text-blue-600">citizen@example.com / citizen123</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Auth Error */}
              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="AlertCircle" size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">{t('signInError')}</h3>
                      <p className="text-sm text-red-700 mt-1">{authError}</p>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(authError)}
                        className="text-xs text-red-600 underline hover:no-underline mt-2"
                      >
                        {t('copyErrorMessage')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <Input
                label={t('emailAddress')}
                type="email"
                placeholder={t('enterEmail')}
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                error={errors?.email}
                required
                autoComplete="email"
              />

              {/* Password */}
              <Input
                label={t('password')}
                type="password"
                placeholder={t('enterPassword')}
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                error={errors?.password}
                required
                autoComplete="current-password"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
                iconName="LogIn"
                iconPosition="left"
                iconSize={16}
              >
                {isSubmitting ? t('signingIn') : t('signIn')}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {t('dontHaveAccount')}{' '}
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  {t('signUpHere')}
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              {t('termsAgreement')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;