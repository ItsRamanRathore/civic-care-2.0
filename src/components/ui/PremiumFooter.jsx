import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, Twitter, Linkedin, Instagram, Youtube,
  CheckCircle, Lock, Globe, Database, Award
} from 'lucide-react';
import Button from './Button';

export const PremiumFooter = () => {
  const currentYear = new Date().getFullYear();

  const FooterColumn = ({ title, links }) => (
    <div className="flex flex-col gap-5">
      <h4 className="text-sm font-heading font-black uppercase tracking-widest text-white">{title}</h4>
      <ul className="flex flex-col gap-3">
        {links.map((link, index) => (
          <li key={index}>
            <Link to={link.path || '#'} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
              {link.label}
              {link.badge && (
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary-foreground border border-primary/30 text-[9px] font-black uppercase">
                  {link.badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-slate-900 text-white pt-24 pb-8 relative overflow-hidden font-body">
      {/* Background Decorative Blob */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
          
          {/* Column 1: Brand (Takes 2 columns for space on LG) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
                <Shield size={20} />
              </div>
              <span className="text-2xl font-heading font-black tracking-tight text-white">Civic Care</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium max-w-xs">
              Transforming civic governance through AI, real-time intelligence, and community participation.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700 w-fit">
                <Shield size={16} className="text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">Government Recognized</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700 w-fit">
                <Database size={16} className="text-blue-400" />
                <span className="text-xs font-bold text-slate-300">ISO 27001 Secure</span>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Features */}
          <FooterColumn 
            title="Platform Features"
            links={[
              { label: 'Live Issue Map', path: '/interactive-issue-map' },
              { label: 'AI Analytics & Forecasting', path: '/analytics-dashboard', badge: 'AI' },
              { label: 'Smart Alerts & SLA Monitoring', path: '/analytics-dashboard' },
              { label: 'Transparency Portal', path: '/public-reports-listing' },
              { label: 'Public API & Open Data', path: '/#' },
            ]}
          />

          {/* Column 3: For Citizens */}
          <FooterColumn 
            title="For Citizens"
            links={[
              { label: 'Report an Issue', path: '/issue-reporting-form' },
              { label: 'Track My Complaint', path: '/#track' },
              { label: 'Community Badges & Reputation', path: '/citizen-dashboard' },
              { label: 'Leaderboard', path: '/citizen-dashboard' },
              { label: 'Notification Preferences', path: '/citizen-dashboard' },
              { label: 'Offline Mode (PWA)', path: '/#', badge: 'New' },
            ]}
          />

          {/* Column 4: For Government */}
          <FooterColumn 
            title="For Government"
            links={[
              { label: 'Admin Dashboard', path: '/admin-dashboard' },
              { label: 'Department Portal', path: '/admin-dashboard' },
              { label: 'Ward Officer Tools', path: '/admin-dashboard' },
              { label: 'Predictive Budget Forecasting', path: '/analytics-dashboard' },
              { label: 'Anomaly Detection System', path: '/analytics-dashboard', badge: 'Pro' },
              { label: 'White Label Solution', path: '/#' },
            ]}
          />

          {/* Column 5: Resources & Company */}
          <FooterColumn 
            title="Resources & Company"
            links={[
              { label: 'How It Works', path: '/#how-it-works' },
              { label: 'Case Studies & Impact', path: '/#' },
              { label: 'API Documentation', path: '/#' },
              { label: 'Help Center', path: '/#' },
              { label: 'Blog', path: '/#' },
              { label: 'Contact Us', path: '/#' },
            ]}
          />
        </div>

        {/* Bottom Bar & Trust Layer */}
        <div className="pt-8 border-t border-slate-800 flex flex-col xl:flex-row justify-between items-center gap-6">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center md:text-left">
                © {currentYear} Civic Care. Made with ❤️ for Indian Citizens.
              </p>
              <div className="hidden md:flex items-center gap-4 border-l border-slate-700 pl-6">
                 {[Twitter, Linkedin, Youtube, Instagram].map((Icon, i) => (
                   <a key={i} href="#" className="text-slate-500 hover:text-white transition-colors">
                     <Icon size={18} />
                   </a>
                 ))}
              </div>
           </div>

           <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {['Privacy Policy', 'Terms of Service', 'Security & Data Policy', 'Annual Transparency Report'].map((l, i) => (
                <Link key={i} to="/#" className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                  {l}
                </Link>
              ))}
           </div>

           <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-800">
                <Globe size={14} className="text-primary" /> Available in 22 Languages
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-800">
                <Lock size={14} className="text-emerald-500" /> SSL Secured
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-800 hidden sm:flex">
                <Shield size={14} className="text-purple-400" /> GDPR Ready
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-800 hidden sm:flex">
                <CheckCircle size={14} className="text-blue-400" /> SOC 2
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
