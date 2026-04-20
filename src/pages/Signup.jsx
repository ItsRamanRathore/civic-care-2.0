import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Icon from '../components/AppIcon';

const Signup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'citizen'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const roleOptions = [
    { value: 'citizen', label: t('citizen'), description: t('citizenDescription') },
    { value: 'department_manager', label: t('departmentManager'), description: t('departmentManagerDescription') }
  ];

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

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = t('fullNameRequired');
    } else if (formData?.fullName?.trim()?.length < 2) {
      newErrors.fullName = t('fullNameMinLength');
    }

    if (!formData?.email?.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (!formData?.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData?.password?.length < 6) {
      newErrors.password = t('passwordMinLength');
    }

    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = t('confirmPasswordRequired');
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch');
    }

    if (formData?.phone && !/^[\+]?[1-9][\d]{0,15}$/?.test(formData?.phone?.replace(/\s/g, ''))) {
      newErrors.phone = t('invalidPhoneNumber');
    }

    if (!formData?.role) {
      newErrors.role = t('roleRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setAuthError('');
    setSuccessMessage('');

    try {
      console.log('🚀 Starting signup process for:', formData?.email);

      const { data, error } = await signUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        role: formData.role,
        phone: formData.phone
      });

      if (error) {
        setAuthError(error.message || t('signupError'));
        return;
      }

      setSuccessMessage(t('accountCreatedRedirecting'));
      setTimeout(() => {
        if (formData.role === 'admin' || formData.role === 'department_manager') {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      }, 2000);

    } catch (error) {
      console.error('💥 Unexpected signup error:', error);
      setAuthError(t('unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="UserPlus" size={24} color="white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{t('createAccount')}</h1>
            <p className="text-muted-foreground">
              {t('joinCivicHub')}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Icon name="CheckCircle" size={20} className="text-green-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">{t('success')}</h3>
                    <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Auth Error */}
              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="AlertCircle" size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">{t('signUpError')}</h3>
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

              {/* Full Name */}
              <Input
                label={t('fullName')}
                type="text"
                placeholder={t('enterFullName')}
                value={formData?.fullName}
                onChange={(e) => handleInputChange('fullName', e?.target?.value)}
                error={errors?.fullName}
                required
                autoComplete="name"
              />

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
                placeholder={t('createPassword')}
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                error={errors?.password}
                required
                autoComplete="new-password"
                description={t('passwordMinLength')}
              />

              {/* Confirm Password */}
              <Input
                label={t('confirmPassword')}
                type="password"
                placeholder={t('confirmYourPassword')}
                value={formData?.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
                error={errors?.confirmPassword}
                required
                autoComplete="new-password"
              />

              {/* Phone (Optional) */}
              <Input
                label={t('phoneNumberOptional')}
                type="tel"
                placeholder="+91 (999) 999-9999"
                value={formData?.phone}
                onChange={(e) => handleInputChange('phone', e?.target?.value)}
                error={errors?.phone}
                autoComplete="tel"
                description={t('smsUpdates')}
              />

              {/* Role */}
              <Select
                label={t('accountType')}
                options={roleOptions}
                value={formData?.role}
                onChange={(value) => handleInputChange('role', value)}
                error={errors?.role}
                required
                description={t('chooseAccountType')}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
                iconName="UserPlus"
                iconPosition="left"
                iconSize={16}
              >
                {isSubmitting ? t('creatingAccount') : t('createAccount')}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {t('alreadyHaveAccount')}{' '}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  {t('signInHere')}
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

export default Signup;