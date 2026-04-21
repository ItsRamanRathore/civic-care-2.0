import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { 
  Map, BarChart3, Search, Info, 
  Plus, Menu, X, Globe, User, BookOpen, Shield, LogOut
} from 'lucide-react';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';

export const PremiumHeader = ({ variant = 'transparent' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { language, switchLanguage, t } = useTranslation();

  const handleLanguageSwitch = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    switchLanguage(newLanguage);
  };

  const handleScroll = () => {
    // Increased threshold slightly for better hero transition
    setIsScrolled(window.scrollY > 40);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('liveMap', 'Live Map'), path: '/interactive-issue-map', icon: Map, isHash: false },
    { name: t('analytics', 'Analytics'), path: '/analytics-dashboard', icon: BarChart3, isHash: false },
    { name: t('browseReports', 'Browse Reports'), path: '/public-reports-listing', icon: BookOpen, isHash: false },
    { name: t('howItWorks', 'How It Works'), path: '/#how-it-works', icon: Info, isHash: true }
  ];

  const getDashboardLabel = () => {
    if (!user) return 'Login';
    if (['admin', 'super_admin'].includes(user.role)) return 'Admin Portal';
    if (['department_head', 'department_manager'].includes(user.role)) return 'Department Hub';
    return 'Citizen Dashboard';
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (['admin', 'super_admin'].includes(user.role)) return '/admin-dashboard';
    if (['department_head', 'department_manager'].includes(user.role)) return '/department-dashboard';
    return '/citizen-dashboard';
  };

  const dashboardLabel = getDashboardLabel();
  const dashboardLink = getDashboardLink();

  // State mapping for better readability
  const isSolid = variant === 'solid' || isScrolled;
  const isLightMode = variant === 'light' && !isScrolled;

  // Header background classes
  const headerBgClasses = isSolid 
    ? 'bg-white/95 backdrop-blur-2xl py-3 shadow-xl border-b border-slate-200' 
    : 'bg-transparent py-5';

  // Text color classes based on background state
  const getTextColorClasses = (baseLight, baseDark) => {
    if (isSolid) return baseDark;
    if (isLightMode) return baseDark;
    return baseLight;
  };

  const brandTextClasses = getTextColorClasses('text-white', 'text-indigo-900');
  const navItemClasses = getTextColorClasses('text-white/80 hover:text-white', 'text-slate-600 hover:text-indigo-600');
  const iconClasses = getTextColorClasses('text-white/60', 'text-indigo-500');

  return (
    <>
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBgClasses}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Left: Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${
              isSolid || isLightMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'
            }`}>
              <Shield size={22} />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-heading font-black tracking-tight leading-none ${brandTextClasses}`}>
                Civic Care
              </span>
              <span className={`text-[9px] font-caption font-black uppercase tracking-[0.2em] mt-1 ${
                isSolid || isLightMode ? 'text-slate-400' : 'text-white/70'
              }`}>
                AI-Powered Platform
              </span>
            </div>
          </Link>

          {/* Center: Anchor Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const LinkComponent = link.isHash ? HashLink : Link;
              return (
                <LinkComponent 
                  key={link.name} 
                  smooth={link.isHash ? true : undefined}
                  to={link.path}
                  className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors relative group ${navItemClasses}`}
                >
                  <link.icon size={15} className={`group-hover:scale-110 transition-transform ${iconClasses}`} />
                  {link.name}
                </LinkComponent>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 lg:gap-5">
             <div className={`hidden md:flex items-center gap-4 border-r pr-5 transition-colors ${
               isSolid || isLightMode ? 'border-slate-200' : 'border-white/20'
             }`}>
                <HashLink 
                  smooth to="/#tracking-section" 
                  className={`text-[11px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 ${navItemClasses}`}
                >
                   <Search size={14} className={iconClasses} />
                   Track
                </HashLink>
                <button 
                  onClick={handleLanguageSwitch}
                  className={`transition-colors flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest ${navItemClasses}`}
                >
                   <Globe size={14} className={iconClasses} />
                   {language === 'en' ? 'हिंदी' : 'EN'}
                </button>
             </div>

             <div className="hidden sm:flex items-center gap-3">
                <Link to={dashboardLink}>
                  <Button 
                    variant="ghost" 
                    className={`text-[11px] font-black uppercase tracking-widest h-10 px-4 rounded-lg transition-all ${
                      isSolid || isLightMode 
                        ? 'text-slate-700 hover:bg-slate-100 hover:text-indigo-600' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <User size={15} className="mr-1.5" />
                    {dashboardLabel}
                  </Button>
                </Link>
                {user && (
                  <Button 
                    variant="ghost" 
                    onClick={signOut}
                    className={`h-10 w-10 p-0 rounded-lg transition-all flex items-center justify-center ${
                      isSolid || isLightMode 
                        ? 'text-slate-400 hover:bg-red-50 hover:text-red-500' 
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </Button>
                )}
                <Link to="/issue-reporting-form">
                  <Button className={`px-5 h-10 rounded-lg shadow-lg font-black text-[11px] uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 ${
                    isSolid || isLightMode 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-white text-indigo-600 hover:bg-indigo-50'
                  }`}>
                    <Plus size={16} className="mr-1.5" /> Report Issue
                  </Button>
                </Link>
             </div>

             {/* Mobile Menu Toggle */}
             <button 
                className={`lg:hidden p-2 transition-colors rounded-xl ${
                  isSolid || isLightMode ? 'text-slate-900 bg-slate-100' : 'text-white bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden absolute w-full shadow-2xl z-50"
          >
            <div className="container mx-auto px-6 py-10 flex flex-col gap-8">
              <div className="grid grid-cols-1 gap-4">
                {navLinks.map((link) => {
                  const LinkComponent = link.isHash ? HashLink : Link;
                  return (
                    <LinkComponent 
                      smooth={link.isHash ? true : undefined}
                      key={link.name} 
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-5 bg-slate-50 hover:bg-indigo-50 rounded-2xl group transition-all"
                    >
                      <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <link.icon size={20} />
                      </div>
                      <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{link.name}</span>
                    </LinkComponent>
                  );
                })}
              </div>
              <hr className="border-slate-100" />
              <div className="flex flex-col gap-6">
                 <Link to={dashboardLink} onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-[0.2em] bg-indigo-600 text-white shadow-lg">
                      <User size={18} className="mr-2" />
                      {dashboardLabel}
                    </Button>
                 </Link>
                 <div className="flex justify-between items-center px-4">
                    <HashLink smooth to="/#tracking-section" onClick={() => setIsMobileMenuOpen(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 flex items-center gap-2">
                       <Search size={16} /> Track Issue
                    </HashLink>
                    <button 
                      onClick={handleLanguageSwitch}
                      className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 flex items-center gap-2"
                    >
                       <Globe size={16} /> {language === 'en' ? 'हिंदी' : 'English'}
                    </button>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    {/* Floating Mobile CTA */}
    <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] pointer-events-none">
      <Link to="/issue-reporting-form" className="pointer-events-auto block w-full">
        <Button className="w-full bg-indigo-600 text-white h-16 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3">
          <Plus size={20} />
          REPORT ISSUE NOW
        </Button>
      </Link>
    </div>
    </>
  );
};

export default PremiumHeader;
