import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '../../contexts/LanguageContext';

const ModernHeader = ({ currentUser, notificationCount = 0 }) => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationLinks = [
    { name: t('home'), path: '/', icon: 'Home' },
    { name: t('reports'), path: '/public-reports-listing', icon: 'FileText' },
    { name: t('howItWorks', 'How It Works'), path: '/faq', icon: 'HelpCircle' },
    { name: t('analytics'), path: '/analytics-dashboard', icon: 'BarChart3' },
    { name: t('support', 'Support'), path: '/faq', icon: 'MessageCircle' }
  ];

  const isActiveLink = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/landing';
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/civic-care-logo.jpg"
              alt="Civic Care Logo"
              className="w-10 h-10 object-cover rounded-lg group-hover:scale-105 transition-all duration-300"
            />
            <div className="hidden sm:block">
              <h1 className="font-bold text-xl text-gray-900">
                Civic Care
              </h1>
              <p className="text-xs text-gray-600">
                {t('civicReportingPlatform')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  isActiveLink(link.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Icon name={link.icon} size={16} />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* Language Toggle & Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageToggle />
            {currentUser ? (
              <div className="flex items-center space-x-3">
                {notificationCount > 0 && (
                  <div className="relative">
                    <Icon name="Bell" size={20} className={isScrolled ? 'text-gray-700' : 'text-white'} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificationCount}
                    </span>
                  </div>
                )}
                <div className={`text-sm font-medium ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
                  {currentUser.name}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="transition-all duration-300 hover:scale-105 text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    {t('signIn')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {t('signUp')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg transition-colors duration-300 text-gray-700 hover:bg-gray-100"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    isActiveLink(link.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={link.icon} size={18} />
                  <span>{link.name}</span>
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-4 space-y-3">
                {/* Language Toggle for Mobile */}
                <div className="px-4 py-2">
                  <LanguageToggle />
                </div>
                {currentUser ? (
                  <div className="px-4 py-2 text-gray-700 font-medium">
                    {t('welcomeBack')}, {currentUser.name}
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center">
                        {t('signIn')}
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full justify-center bg-red-600 hover:bg-red-700">
                        {t('signUp')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ModernHeader;