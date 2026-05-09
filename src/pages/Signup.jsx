import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import PremiumHeader from '../components/ui/PremiumHeader';
import PremiumFooter from '../components/ui/PremiumFooter';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { UserPlus, CheckCircle, AlertCircle, Shield, User, ArrowLeft, Phone, Mail, Lock } from 'lucide-react';

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
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [unverifiedUserId, setUnverifiedUserId] = useState(null);

  const roleOptions = [
    { value: 'citizen', label: t('citizen'), description: t('citizenDescription') },
    { value: 'department_manager', label: t('departmentManager'), description: t('departmentManagerDescription') }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (authError) setAuthError('');
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
    if (!formData?.phone) {
      newErrors.phone = t('phoneRequired', 'Phone number is required');
    } else if (!/^[\+]?[1-9][\d]{0,15}$/?.test(formData?.phone?.replace(/\s/g, ''))) {
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

      setSuccessMessage(t('accountCreatedVerify', 'Account created! Please check your email for a verification link and enter the OTP sent to your phone.'));
      setUnverifiedUserId(data.data.user.id);
      setShowOtpModal(true);
    } catch (error) {
      setAuthError(t('unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpValue.length < 4) return;

    setIsVerifyingOtp(true);
    try {
      const response = await apiClient.post('/auth/verify-phone', { code: otpValue });
      if (response.data.status === 'success') {
        setSuccessMessage(t('phoneVerified', 'Phone verified! Redirecting to dashboard...'));
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-body selection:bg-purple-100 selection:text-purple-900">
      <PremiumHeader variant="light" />
      
      {/* Immersive Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -45, 0],
            x: [0, -50, 0],
            y: [0, 100, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[5%] -right-[5%] w-[45%] h-[45%] bg-purple-500/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
            x: [0, 50, 0],
            y: [0, -100, 0]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[5%] -left-[5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[110px]" 
        />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <main className="container mx-auto px-4 pt-40 pb-24 relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl"
        >
          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-20 h-20 bg-purple-600 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-200 ring-8 ring-purple-50"
            >
              <UserPlus size={36} className="text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
              {t('createAccount', 'Join the Movement')}
            </h1>
            <p className="text-xl text-slate-500 font-medium tracking-tight">
              Be the voice of your community. Start reporting issues today.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-3xl p-12 rounded-[56px] border border-white shadow-[0_40px_120px_rgba(0,0,0,0.06)] relative overflow-hidden"
          >
            {/* Success Message Overlay */}
            <AnimatePresence>
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                  className="absolute inset-0 z-50 bg-white/40 flex items-center justify-center p-10 text-center"
                >
                  <motion.div 
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white p-8 rounded-[40px] shadow-2xl border border-emerald-50 max-w-sm"
                  >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} className="text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 font-heading tracking-tight">{t('success', 'Account Verified')}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{successMessage}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-12">
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50/80 backdrop-blur-md border border-red-100 rounded-2xl p-5"
                >
                  <div className="flex items-start space-x-3 text-red-800">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-bold tracking-tight">{authError}</p>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Personal Details */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-l-4 border-purple-600 pl-4">
                  <span className="text-xs font-black text-purple-600 uppercase tracking-[0.3em]">Step 01</span>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Identity Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('fullName')}
                    placeholder="Enter full legal name"
                    value={formData?.fullName}
                    onChange={(e) => handleInputChange('fullName', e?.target?.value)}
                    error={errors?.fullName}
                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-purple-500/20 transition-all text-base px-5 font-medium"
                    required
                  />
                  <Input
                    label={t('emailAddress')}
                    type="email"
                    placeholder="your@email.com"
                    value={formData?.email}
                    onChange={(e) => handleInputChange('email', e?.target?.value)}
                    error={errors?.email}
                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-purple-500/20 transition-all text-base px-5 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Step 2: Account Security */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-l-4 border-indigo-600 pl-4">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Step 02</span>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Security & Role</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('password')}
                    type="password"
                    placeholder="Create a strong password"
                    value={formData?.password}
                    onChange={(e) => handleInputChange('password', e?.target?.value)}
                    error={errors?.password}
                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-indigo-500/20 transition-all text-base px-5 font-medium"
                    required
                  />
                  <Input
                    label={t('confirmPassword')}
                    type="password"
                    placeholder="Re-type password"
                    value={formData?.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
                    error={errors?.confirmPassword}
                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-indigo-500/20 transition-all text-base px-5 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label={t('accountType')}
                    options={roleOptions}
                    value={formData?.role}
                    onChange={(value) => handleInputChange('role', value)}
                    error={errors?.role}
                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all text-base font-medium"
                    required
                  />
                  <Input
                    label={t('phoneNumber')}
                    type="tel"
                    placeholder="+91 (XXX) XXX-XXXX"
                    value={formData?.phone}
                    onChange={(e) => handleInputChange('phone', e?.target?.value)}
                    error={errors?.phone}
                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all text-base px-5 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col gap-6">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full h-20 rounded-3xl bg-slate-900 hover:bg-black text-white font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-4 border-0"
                >
                  <UserPlus size={24} />
                  {isSubmitting ? t('creatingAccount') : t('createAccount')}
                </Button>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm font-bold text-slate-500 transition-colors">
                  {t('alreadyHaveAccount', 'Already a member of Civic Care?')}
                  <Link to="/login" className="text-purple-600 hover:underline flex items-center gap-1">
                    {t('signInHere', "Sign in to your account")}
                    <ArrowLeft className="rotate-180" size={16} />
                  </Link>
                </div>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] max-w-md mx-auto leading-relaxed">
              By creating an account, you contribute to a more transparent and responsible society. Your data is encrypted as per Government Security Directives.
            </p>
          </motion.div>
        </motion.div>
      </main>

      <PremiumFooter />
    </div>
  );
};

export default Signup;