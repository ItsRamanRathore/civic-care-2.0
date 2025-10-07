import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const ModernFooter = () => {
  const quickLinks = [
    { name: 'Report Issue', path: '/issue-reporting-form', icon: 'Plus' },
    { name: 'Browse Reports', path: '/public-reports-listing', icon: 'Search' },
    { name: 'Issue Map', path: '/interactive-issue-map', icon: 'Map' },
    { name: 'Analytics', path: '/analytics-dashboard', icon: 'BarChart3' },
    { name: 'Citizen Dashboard', path: '/citizen-dashboard', icon: 'User' }
  ];

  const supportLinks = [
    { name: 'Help Center', path: '/faq', icon: 'HelpCircle' },
    { name: 'Contact Us', path: '/contact', icon: 'Mail' },
    { name: 'Privacy Policy', path: '/privacy', icon: 'Shield' },
    { name: 'Terms of Service', path: '/terms', icon: 'FileText' },
    { name: 'API Documentation', path: '/api-docs', icon: 'Code' }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: 'Twitter', url: '#', color: 'hover:text-blue-400' },
    { name: 'Facebook', icon: 'Facebook', url: '#', color: 'hover:text-blue-600' },
    { name: 'LinkedIn', icon: 'Linkedin', url: '#', color: 'hover:text-blue-700' },
    { name: 'Instagram', icon: 'Instagram', url: '#', color: 'hover:text-pink-500' },
    { name: 'YouTube', icon: 'Youtube', url: '#', color: 'hover:text-red-500' }
  ];

  const governmentPartners = [
    'Digital India',
    'Smart Cities Mission',
    'Ministry of Electronics & IT',
    'National e-Governance Plan'
  ];

  return (
    <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-blue-500 to-red-500"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-red-500/10 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="Shield" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-2xl">Civic Care</h3>
                <p className="text-blue-200 text-sm">Civic Reporting Platform</p>
              </div>
            </div>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Empowering citizens to report civic issues and track their resolution in real-time. 
              Building stronger communities through transparency and accountability.
            </p>
            
            {/* Government Certification */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Award" size={16} className="text-yellow-400" />
                <span className="text-sm font-medium">Government Certified</span>
              </div>
              <div className="text-xs text-blue-200 space-y-1">
                {governmentPartners.map((partner, index) => (
                  <div key={index}>• {partner}</div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:bg-white/20 ${social.color}`}
                    title={social.name}
                  >
                    <Icon name={social.icon} size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 flex items-center">
              <Icon name="Zap" size={20} className="text-red-400 mr-2" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center space-x-3 text-blue-100 hover:text-white transition-all duration-300 group"
                  >
                    <Icon name={link.icon} size={16} className="group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-6 flex items-center">
              <Icon name="Headphones" size={20} className="text-green-400 mr-2" />
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center space-x-3 text-blue-100 hover:text-white transition-all duration-300 group"
                  >
                    <Icon name={link.icon} size={16} className="group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="mt-6 bg-white/5 rounded-lg p-4">
              <h5 className="font-medium mb-3">24/7 Support</h5>
              <div className="space-y-2 text-sm text-blue-200">
                <div className="flex items-center space-x-2">
                  <Icon name="Phone" size={14} />
                  <span>1800-XXX-XXXX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Mail" size={14} />
                  <span>support@civiccare.gov.in</span>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter & Updates */}
          <div>
            <h4 className="font-bold text-lg mb-6 flex items-center">
              <Icon name="Bell" size={20} className="text-yellow-400 mr-2" />
              Stay Updated
            </h4>
            <p className="text-blue-100 mb-4 text-sm">
              Get the latest updates on community improvements and platform features.
            </p>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Icon name="Send" size={16} />
                </Button>
              </div>
              
              <div className="text-xs text-blue-200">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </div>
            </div>

            {/* App Download */}
            <div className="mt-6">
              <h5 className="font-medium mb-3">Download Our App</h5>
              <div className="flex space-x-2">
                <button className="bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 transform hover:scale-105">
                  <Icon name="Smartphone" size={14} className="inline mr-1" />
                  Play Store
                </button>
                <button className="bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 transform hover:scale-105">
                  <Icon name="Smartphone" size={14} className="inline mr-1" />
                  App Store
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-blue-200 text-sm">
              © {new Date().getFullYear()} Civic Care. All rights reserved. | Made with ❤️ for Indian Citizens
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-blue-200">
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={14} className="text-green-400" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={14} className="text-green-400" />
                <span>ISO 27001 Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Globe" size={14} className="text-blue-400" />
                <span>Available in 22 Languages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;