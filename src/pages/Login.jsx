import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import PremiumHeader from '../components/ui/PremiumHeader';
import PremiumFooter from '../components/ui/PremiumFooter';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/AppIcon';
import { LogIn, AlertCircle, Shield, User, ArrowRight } from 'lucide-react';

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
  useEffect(() => {
    if (user) {
      const userRole = user.role;
      if (['admin', 'super_admin'].includes(userRole)) {
        navigate('/admin-dashboard');
      } else if (['department_head', 'department_manager'].includes(userRole)) {
        navigate('/department-dashboard');
      } else {
        navigate('/citizen-dashboard');
      }
    }
  }, [user, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (authError) setAuthError('');
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
        setAuthError(error.message || t('signinError'));
      } else if (data?.user) {
        const userRole = data.user.role;
        if (['admin', 'super_admin'].includes(userRole)) {
          navigate('/admin-dashboard');
        } else if (['department_head', 'department_manager'].includes(userRole)) {
          navigate('/department-dashboard');
        } else {
          navigate('/citizen-dashboard');
        }
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [selectedDemoRole, setSelectedDemoRole] = useState('');
  const [selectedDepartmentValue, setSelectedDepartmentValue] = useState('roads');

  const handleDemoLogin = (role, email, password) => {
    setSelectedDemoRole(role);
    setFormData({ email, password });
    setAuthError('');
    setErrors({});
    
    if (role === 'department') {
      localStorage.setItem('demo_target_department', selectedDepartmentValue);
    } else {
      localStorage.removeItem('demo_target_department');
    }
  };

  const handleDepartmentSelectChange = (e) => {
    const newVal = e.target.value;
    setSelectedDepartmentValue(newVal);
    if (selectedDemoRole === 'department') {
      localStorage.setItem('demo_target_department', newVal);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-body selection:bg-indigo-100 selection:text-indigo-900">
      <PremiumHeader variant="light" />
      
      {/* Immersive Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" 
        />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <main className="container mx-auto px-4 pt-32 pb-24 relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl px-4"
        >
          {/* Header Section */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200 ring-8 ring-indigo-50"
            >
              <Shield size={36} className="text-white" />
            </motion.div>
            <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
              {t('signIn', 'Welcome Back')}
            </h1>
            <p className="text-xl text-slate-500 font-medium tracking-tight">
              Access the AI-Powered Civic Intelligence Portal
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {/* Form Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-2xl p-10 rounded-[48px] border border-white/60 shadow-[0_30px_100px_rgba(0,0,0,0.05)] relative overflow-hidden"
            >
              {/* Subtle gradient border effect */}
              <div className="absolute inset-0 border border-white/40 rounded-[48px] pointer-events-none" />

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <AnimatePresence mode="wait">
                  {authError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50/80 backdrop-blur-md border border-red-100 rounded-2xl p-5 mb-4"
                    >
                      <div className="flex items-start space-x-3">
                        <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-bold text-red-800 tracking-tight">{t('signInError')}</h3>
                          <p className="text-sm text-red-600 mt-1 leading-relaxed">{authError}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-5">
                  <Input
                    label={t('emailAddress')}
                    type="email"
                    placeholder="name@organization.gov"
                    value={formData?.email}
                    onChange={(e) => handleInputChange('email', e?.target?.value)}
                    error={errors?.email}
                    className="h-14 rounded-2xl bg-white/50 border-slate-200 focus:bg-white transition-all text-base font-medium px-5"
                    required
                  />

                  <Input
                    label={t('password')}
                    type="password"
                    placeholder="Enter secure password"
                    value={formData?.password}
                    onChange={(e) => handleInputChange('password', e?.target?.value)}
                    error={errors?.password}
                    className="h-14 rounded-2xl bg-white/50 border-slate-200 focus:bg-white transition-all text-base font-medium px-5"
                    required
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-3 border-0"
                  >
                    {!isSubmitting && <LogIn size={20} />}
                    {isSubmitting ? t('signingIn') : t('signIn')}
                  </Button>
                  
                  <Link to="/signup" className="group flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors py-2">
                    {t('dontHaveAccount', "Don't have an account?")} <span className="text-indigo-600 group-hover:underline">{t('signUpHere', "Create one now")}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </form>
            </motion.div>

            {/* Premium Demo Credentials UI */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full flex flex-col items-center"
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">{t('demoAccounts', 'Demo Access Hub')}</span>
              <div className="flex flex-wrap justify-center gap-4">
                {/* Citizen Demo */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('citizen', 'citizen@example.com', 'citizen123')}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-3xl transition-all duration-300 w-32 ${
                    selectedDemoRole === 'citizen' 
                      ? 'bg-purple-50/80 border-purple-400 shadow-[0_10px_30px_rgba(168,85,247,0.2)] scale-105' 
                      : 'bg-white/60 border-white hover:border-purple-200 hover:bg-purple-50/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                    selectedDemoRole === 'citizen' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <User size={24} />
                  </div>
                  <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider text-center leading-tight">
                    Citizen
                  </div>
                </button>

                {/* Admin Demo */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin', 'admin@civic.gov', 'admin123')}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-3xl transition-all duration-300 w-32 ${
                    selectedDemoRole === 'admin' 
                      ? 'bg-indigo-50/80 border-indigo-400 shadow-[0_10px_30px_rgba(79,70,229,0.2)] scale-105' 
                      : 'bg-white/60 border-white hover:border-indigo-200 hover:bg-indigo-50/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                    selectedDemoRole === 'admin' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    <Shield size={24} />
                  </div>
                  <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider text-center leading-tight">
                    Admin
                  </div>
                </button>

                {/* Department Demo */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('department', 'dept@civic.gov', 'dept123')}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-3xl transition-all duration-300 w-32 ${
                    selectedDemoRole === 'department' 
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.2)] scale-105' 
                      : 'bg-white/60 border-white hover:border-emerald-200 hover:bg-emerald-50/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                    selectedDemoRole === 'department' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Icon name="Briefcase" size={24} />
                  </div>
                  <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider text-center leading-tight">
                    Dept Head
                  </div>
                </button>
              </div>

              <AnimatePresence>
                {selectedDemoRole === 'department' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="w-full max-w-sm overflow-hidden"
                  >
                    <div className="bg-emerald-50/50 p-4 border border-emerald-100/50 rounded-2xl flex flex-col items-center gap-2">
                        <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Select Department Jurisdiction</label>
                        <select 
                          value={selectedDepartmentValue} 
                          onChange={handleDepartmentSelectChange}
                          className="w-full bg-white border border-emerald-200 text-slate-700 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 font-medium outline-none"
                        >
                           <option value="roads">Roads & Transport</option>
                           <option value="utilities">Utilities & Energy</option>
                           <option value="sanitation">Sanitation & Waste</option>
                           <option value="health">Public Health</option>
                        </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-12">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
              {t('termsAgreement', 'By signing in, you agree to our Terms of Service and Privacy Policy for Government Data Protection.')}
            </p>
          </div>
        </motion.div>
      </main>

      <PremiumFooter />
    </div>
  );
};

export default Login;