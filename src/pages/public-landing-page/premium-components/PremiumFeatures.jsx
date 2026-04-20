import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MapPin, TrendingUp, Award, Bell, Wifi, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../../../contexts/LanguageContext';

const FeatureCard = ({ icon: Icon, title, description, metrics, link, gradient, colorClass, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm hover:shadow-premium transition-all duration-500 relative overflow-hidden"
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
        <Icon size={32} />
      </div>

      <h3 className="text-2xl font-black text-neutral-900 mb-4 group-hover:text-primary-blue transition-colors">
        {title}
      </h3>
      
      <p className="text-neutral-500 leading-relaxed font-medium mb-8">
        {description}
      </p>

      {metrics && (
        <div className="flex gap-8 mb-8 border-t border-neutral-50 pt-6">
          {metrics.map((m, i) => (
            <div key={i}>
              <p className={`text-xl font-black ${colorClass}`}>{m.value}</p>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      <button className="flex items-center gap-2 text-primary-blue text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
        {link} <ArrowRight size={14} />
      </button>
      
      {/* Decorative pulse element for real-time features */}
      {title.includes('Live') && (
        <div className="absolute top-8 right-8">
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const PremiumFeatures = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Brain,
      title: "AI Smart Dispatch",
      description: "Google Gemini analyzes your report and automatically routes it to the right department within seconds. No forms, no confusion.",
      gradient: "from-[#7c3aed] to-[#2563eb]",
      colorClass: "text-[#7c3aed]",
      link: "See How It Works",
      metrics: [{ value: "95%", label: "Accuracy" }, { value: "<2s", label: "Processing" }],
      delay: 0.1
    },
    {
      icon: MapPin,
      title: "Live Issue Heatmap",
      description: "Visualize problem clusters across your city in real-time. See where action is needed most with geospatial intelligence.",
      gradient: "from-[#06b6d4] to-[#059669]",
      colorClass: "text-[#06b6d4]",
      link: "Explore Map",
      metrics: [{ value: "Real-time", label: "Updates" }, { value: "City-wide", label: "Coverage" }],
      delay: 0.2
    },
    {
      icon: TrendingUp,
      title: "Predictive Forecasting",
      description: "AI predicts infrastructure failures before they happen. Plan budgets and resources with 30-day forecasting models.",
      gradient: "from-[#f59e0b] to-[#ea580c]",
      colorClass: "text-[#ea580c]",
      link: "View Analytics",
      metrics: [{ value: "30-Day", label: "Forecasts" }, { value: "88%", label: "Accuracy" }],
      delay: 0.3
    },
    {
      icon: Award,
      title: "Civic Gamification",
      description: "Earn Bronze, Silver, and Gold badges. Top contributors get priority response and verified reporter status.",
      gradient: "from-[#2563eb] to-[#06b6d4]",
      colorClass: "text-[#2563eb]",
      link: "Learn Rewards",
      delay: 0.4
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get updates via email, push, or SMS. AI respects your quiet hours and batches non-urgent alerts.",
      gradient: "from-[#dc2626] to-[#f59e0b]",
      colorClass: "text-[#dc2626]",
      link: "Setup Alerts",
      delay: 0.5
    },
    {
      icon: Wifi,
      title: "Offline Ready (PWA)",
      description: "Field workers can report issues without internet. Data syncs automatically when connection returns.",
      gradient: "from-[#1e3a8a] to-[#7c3aed]",
      colorClass: "text-[#1e3a8a]",
      link: "Get the App",
      delay: 0.6
    }
  ];

  return (
    <section className="py-32 bg-stone-50/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles size={14} /> {t('intelligenceAction', 'Intelligence Meets Civic Action')}
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-neutral-900 mb-8 leading-tight">
            {t('governanceBuilt', 'Governance Built')} <br />
            <span className="text-primary-blue">{t('forTheFuture', 'For The Future')}</span>
          </h2>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto font-medium">
            {t('featuresContext', 'Our platform combines cutting-edge AI, real-time analytics, and community-driven insights to transform how cities respond to citizen needs.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumFeatures;
