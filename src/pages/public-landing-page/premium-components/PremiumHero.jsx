import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Play, Shield, Zap, Users, CheckCircle, Sparkles, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../contexts/LanguageContext';

export const PremiumHero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-primary min-h-screen flex items-center">
      {/* Animated Background Dot Grid */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-20"></div>
      
      {/* Floating Reality Cards (Depth & Context) */}
      <div className="hidden lg:block">
        <motion.div 
          className="absolute top-40 right-[15%] z-30"
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-5 flex items-center gap-4 border border-neutral-100 ring-1 ring-black/5 animate-float">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="text-green-600 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-black text-neutral-900">Issue Resolved!</p>
              <p className="text-[10px] font-bold text-neutral-400">Pothole fixed in 18hrs</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="absolute bottom-48 left-[5%] z-30"
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-5 flex items-center gap-4 border border-neutral-100 ring-1 ring-black/5 animate-float-delayed">
            <div className="relative">
              <div className="w-3 h-3 bg-secondary rounded-full animate-ping absolute" />
              <div className="w-3 h-3 bg-secondary rounded-full" />
            </div>
            <div>
              <p className="text-sm font-black text-neutral-900">AI Categorized</p>
              <p className="text-[10px] font-bold text-neutral-400">Routed to Roads Dept in 1.2s</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-10 relative z-10 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Content - More breathing room */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full text-white text-sm font-bold mb-10 tracking-widest uppercase ring-1 ring-white/30 shadow-xl">
              <Sparkles size={16} className="text-secondary" />
              {t('aiPoweredCivicPlatform', 'AI-Powered Civic Intelligence Platform')}
            </div>

            <h1 className="text-7xl md:text-8xl font-black text-white leading-[1.02] mb-10 tracking-tighter">
              {t('yourVoice', 'Your Voice.')}<br />
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent animate-pulse drop-shadow-md">
                {t('realAction', 'Real Action.')}
              </span><br />
              {t('betterCities', 'Better Cities.')}
            </h1>

            <p className="text-2xl text-white/90 mb-12 max-w-lg leading-relaxed font-medium">
              {t('heroDesc', 'Report civic issues with AI-powered categorization. Track resolution in real-time. Build transparent, responsive communities.')}
            </p>

            {/* CTAs - Larger & More Weight */}
            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              <Link to="/issue-reporting-form">
                <Button size="xl" className="bg-white text-primary hover:bg-neutral-100 px-12 h-20 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 transition-all">
                  <Camera className="mr-3" size={24} />
                  {t('reportIssue', 'Report Issue Now')}
                </Button>
              </Link>
              <Link to="/faq">
                <Button variant="outline" size="xl" className="border-2 border-white/50 text-white hover:bg-white/10 px-12 h-20 rounded-2xl font-bold text-sm backdrop-blur-sm transition-all hover:border-white">
                  <Play className="mr-3" size={22} fill="currentColor" />
                  {t('watchDemo', 'Watch Demo')}
                </Button>
              </Link>
            </div>

            {/* Trust Indicators - Upgraded */}
            <div className="flex flex-wrap gap-10">
              <div className="flex items-center gap-3">
                <Shield size={22} className="text-secondary" />
                <span className="text-white/80 text-sm font-bold tracking-wide uppercase">{t('bankLevelSecurity', 'Bank-Level Security')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap size={22} className="text-secondary" />
                <span className="text-white/80 text-sm font-bold tracking-wide uppercase">{t('aiAutoDispatch', 'AI Auto-Dispatch')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles size={22} className="text-secondary" />
                <span className="text-white/80 text-sm font-bold tracking-wide uppercase">{t('48Rating', '4.8★ Rating')}</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Phone Mockup */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="relative z-10 w-[320px] bg-black rounded-[3rem] border-[12px] border-neutral-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group">
              
              {/* Dynamic Island Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-50 flex items-center justify-between px-2">
                 <div className="w-2 h-2 rounded-full bg-secondary/40" />
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
              </div>

              {/* Enhanced Mobile Screen Content */}
              <div className="bg-neutral-50 h-[650px] w-full rounded-[2rem] overflow-hidden relative font-sans">
                
                {/* Mobile App Header */}
                <div className="bg-primary pt-12 pb-4 px-6 text-white text-center shadow-md border-b border-primary/50">
                  <h4 className="font-black tracking-tight text-lg">Civic Care</h4>
                  <p className="text-[10px] uppercase tracking-widest text-blue-200">Live City Feed</p>
                </div>

                {/* Mobile Feed */}
                <div className="p-4 space-y-4">
                   <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase px-2 py-1 tracking-widest rounded-bl-lg">Resolved</div>
                      <h5 className="font-black text-neutral-900 text-sm mb-1 line-clamp-1">Pothole on 5th Ave</h5>
                      <p className="text-xs text-neutral-400 font-bold mb-3">Reported by Sarah J.</p>
                      <div className="bg-neutral-50 rounded-xl p-2 flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Fixed in 12h</span>
                      </div>
                   </div>

                   <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-[8px] font-black uppercase px-2 py-1 tracking-widest rounded-bl-lg">In Progress</div>
                      <h5 className="font-black text-neutral-900 text-sm mb-1 line-clamp-1">Broken Streetlight</h5>
                      <p className="text-xs text-neutral-400 font-bold mb-3">Ward 7, Lincoln St.</p>
                      <div className="bg-blue-50 rounded-xl p-2 flex items-center gap-2">
                        <Zap size={14} className="text-secondary" />
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Dispatched to Elec</span>
                      </div>
                   </div>

                   {/* Action Button Mock */}
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                      <div className="bg-neutral-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                        <Camera size={24} />
                      </div>
                   </div>
                </div>
              </div>

              {/* Glowing effects */}
              <div className="absolute -inset-20 bg-secondary/20 blur-[100px] pointer-events-none -z-10" />
              <div className="absolute -inset-20 bg-accent/20 blur-[100px] pointer-events-none -z-10 translate-x-1/2" />
            </div>

          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
};

export default PremiumHero;
