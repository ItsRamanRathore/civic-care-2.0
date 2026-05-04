import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, Triangle, List, 
  MapPin, Camera, FileText, 
  Users, TrendingUp, Copy, 
  Send, Clock, Bell,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../../../contexts/LanguageContext';

const ArchitectureCard = ({ number, title, subtitle, subCards, isLast }) => {
  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Vertical Connecting Line */}
      {!isLast && (
        <div className="absolute top-[80px] bottom-[-64px] md:bottom-[-96px] left-[56px] md:left-[72px] w-[2px] bg-cyan-400/30 z-0" />
      )}
      
      <motion.div 
        className="bg-white rounded-[32px] p-6 md:p-10 w-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative z-10 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-6 relative z-10 bg-white">
          <div className="w-16 h-16 shrink-0 rounded-[20px] bg-cyan-50 border border-cyan-100 flex items-center justify-center shadow-sm">
            <span className="text-xl font-black text-cyan-500 tracking-tighter">{number}</span>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">{title}</h3>
            <p className="text-sm font-bold text-neutral-400 mt-1 uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10 bg-white">
          {subCards.map((card, index) => (
            <div 
              key={index} 
              className="bg-neutral-50/50 border border-neutral-100/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300 group cursor-default"
            >
              <card.icon className="text-cyan-400 group-hover:text-cyan-500 group-hover:scale-110 transition-all duration-300" size={28} strokeWidth={1.5} />
              <span className="text-sm font-bold text-neutral-600 group-hover:text-neutral-900 transition-colors">{card.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export const PremiumHowItWorks = () => {
  const { t } = useTranslation();

  const architectureSteps = [
    {
      number: "01",
      title: "Intake Gateway",
      subtitle: "Multi-modal reporting node",
      subCards: [
        { icon: MapPin, text: "Smart Location" },
        { icon: Camera, text: "Media Processing" },
        { icon: FileText, text: "Metadata Parsing" }
      ]
    },
    {
      number: "02",
      title: "Community Consensus",
      subtitle: "Decentralized validation",
      subCards: [
        { icon: Users, text: "Crowd Verification" },
        { icon: TrendingUp, text: "Priority Weighting" },
        { icon: Copy, text: "Duplicate Detection" }
      ]
    },
    {
      number: "03",
      title: "AI Engine",
      subtitle: "Gemini reasoning core",
      subCards: [
        { icon: Star, text: "Gemini Pro" },
        { icon: Triangle, text: "Anomaly Detection" },
        { icon: List, text: "Ranked Actions" }
      ]
    },
    {
      number: "04",
      title: "Resolution Matrix",
      subtitle: "Departmental execution",
      subCards: [
        { icon: Send, text: "Auto-Dispatch" },
        { icon: Clock, text: "SLA Monitoring" },
        { icon: Bell, text: "Real-Time Webhooks" }
      ]
    }
  ];

  return (
    <section className="py-32 bg-[#1e3a8a] relative overflow-hidden">
      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute inset-0 bg-dot-grid opacity-10" />
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-400 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 opacity-20" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#7c3aed] rounded-full blur-[150px] translate-y-1/2 -translate-x-1/3 opacity-30" />
      </div>

      <div className="container mx-auto px-4 md:px-10 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white/90 text-[10px] font-black tracking-widest uppercase mb-6 ring-1 ring-white/20 shadow-xl backdrop-blur-md"
          >
            System Architecture
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
          >
            {t('howItWorksTitle', 'From Report To Resolution')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-100/70 max-w-2xl mx-auto font-medium"
          >
            The underlying infrastructure powering Civic Care's automated issue resolution pipeline.
          </motion.p>
        </div>

        <div className="flex flex-col gap-16 md:gap-24 relative">
          {architectureSteps.map((step, index) => (
            <ArchitectureCard 
              key={index}
              number={step.number}
              title={step.title}
              subtitle={step.subtitle}
              subCards={step.subCards}
              isLast={index === architectureSteps.length - 1}
            />
          ))}
        </div>

        <div className="mt-32 text-center relative z-10">
           <button className="h-16 px-12 bg-white text-[#1e3a8a] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 flex items-center gap-3 mx-auto">
             Initialize Report <ArrowRight size={18} />
           </button>
        </div>
      </div>
    </section>
  );
};

export default PremiumHowItWorks;
