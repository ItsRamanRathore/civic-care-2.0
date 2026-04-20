import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { 
  Map, BarChart3, Search, Info, 
  Plus, Menu, X, Globe, User, BookOpen
} from 'lucide-react';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';

export const PremiumHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { language, switchLanguage, t } = useTranslation();

  const handleLanguageSwitch = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    switchLanguage(newLanguage);
  };

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 20);
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

  const dashboardLabel = user 
    ? (user.role === 'admin' || user.role === 'department_manager' ? 'Admin Portal' : 'Citizen Dashboard')
    : 'Login';

  const dashboardLink = user 
    ? (user.role === 'admin' || user.role === 'department_manager' ? '/admin-dashboard' : '/citizen-dashboard')
    : '/login';

  return (
    <>
    <header className={`fixed top-0 left-0 right-0 z-50 transition-layout ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-xl py-3 shadow-card border-b border-border' 
        : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Left: Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${isScrolled ? 'bg-primary text-primary-foreground' : 'bg-white text-primary'}`}>
              <Shield size={24} />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-heading font-bold tracking-tight leading-none ${isScrolled ? 'text-primary' : 'text-white'}`}>
                Civic Care
              </span>
              <span className={`text-[10px] font-caption font-bold uppercase tracking-widest mt-1 ${isScrolled ? 'text-text-secondary' : 'text-white/80'}`}>
                AI-Powered Civic Platform
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
                  className={`flex items-center gap-2 text-xs font-heading font-bold transition-colors relative group ${
                    isScrolled ? 'text-text-secondary hover:text-primary' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <link.icon size={16} className={`group-hover:scale-110 transition-transform ${isScrolled ? 'text-secondary' : 'text-white/60'}`} />
                  {link.name}
                </LinkComponent>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 lg:gap-5">
             <div className="hidden md:flex items-center gap-4 border-r pr-5 transition-colors border-white/20">
                <HashLink smooth to="/#tracking-section" className={`text-xs font-bold transition-colors flex items-center gap-1.5 ${isScrolled ? 'text-text-secondary hover:text-primary border-border' : 'text-white/80 hover:text-white'}`}>
                   <Search size={14} />
                   Track Issue
                </HashLink>
                <button 
                  onClick={handleLanguageSwitch}
                  className={`transition-colors flex items-center gap-1.5 text-xs font-bold ${isScrolled ? 'text-text-secondary hover:text-primary' : 'text-white/80 hover:text-white'}`}
                >
                   <Globe size={14} />
                   {language === 'en' ? 'हिंदी' : 'English'}
                </button>
             </div>

             <div className="hidden sm:flex items-center gap-3">
                <Link to={dashboardLink}>
                  <Button variant={isScrolled ? 'ghost' : 'outline'} className={`text-xs font-bold ${isScrolled ? 'text-primary hover:bg-muted' : 'border-white/30 text-white hover:bg-white/10'}`}>
                    <User size={16} className="mr-1.5" />
                    {dashboardLabel}
                  </Button>
                </Link>
                <Link to="/issue-reporting-form">
                  <Button className={`px-5 h-10 rounded-lg shadow-md font-bold text-xs ${isScrolled ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-white text-primary hover:bg-white/90'}`}>
                    <Plus size={16} className="mr-1.5" /> Report Issue
                  </Button>
                </Link>
             </div>

             {/* Mobile Menu Toggle */}
             <button 
                className={`lg:hidden p-2 transition-colors ${isScrolled ? 'text-primary' : 'text-white'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border overflow-hidden absolute w-full shadow-modal"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                {navLinks.map((link) => {
                  const LinkComponent = link.isHash ? HashLink : Link;
                  return (
                    <LinkComponent 
                      smooth={link.isHash ? true : undefined}
                      key={link.name} 
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col gap-2 p-4 bg-muted/50 rounded-xl"
                    >
                      <link.icon size={20} className="text-primary" />
                      <span className="text-sm font-bold text-text-primary">{link.name}</span>
                    </LinkComponent>
                  );
                })}
              </div>
              <hr className="border-border" />
              <div className="flex flex-col gap-4">
                 <Link to={dashboardLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold flex justify-center">
                      <User size={18} className="mr-2" />
                      {dashboardLabel}
                    </Button>
                 </Link>
                 <div className="flex justify-between items-center px-2">
                    <HashLink smooth to="/#tracking-section" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-text-secondary flex items-center gap-2">
                       <Search size={16} /> Track Issue
                    </HashLink>
                    <button 
                      onClick={handleLanguageSwitch}
                      className="text-sm font-bold text-text-secondary flex items-center gap-2"
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
        <Button className="w-full bg-primary text-primary-foreground h-14 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.3)] font-black text-sm flex items-center justify-center">
          <Plus size={20} className="mr-2" />
          REPORT AN ISSUE NOW
        </Button>
      </Link>
    </div>
    </>
  );
};

// Ensure a placeholder exists for Shield icon which wasn't fully imported in the snippet
const Shield = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);

export default PremiumHeader;
