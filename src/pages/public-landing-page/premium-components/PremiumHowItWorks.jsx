import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Brain, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../contexts/LanguageContext';

const Step = ({ number, icon: Icon, title, description, badge, active, delay }) => {
  return (
    <motion.div 
      className="flex flex-col items-center text-center max-w-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <div className={`relative w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 transition-all duration-500 ${
        active 
          ? 'bg-white text-primary-blue shadow-2xl scale-110' 
          : 'bg-white/10 text-white/50 border border-white/10 hover:border-white/30'
      }`}>
        <Icon size={40} />
        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-[#ea580c] flex items-center justify-center text-white font-black text-sm shadow-lg">
          {number}
        </div>
      </div>
      <h3 className="text-2xl font-black mb-4 text-white">{title}</h3>
      <p className="text-white/60 leading-relaxed font-medium mb-6">{description}</p>
      {badge && (
        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/80 ring-1 ring-white/20">
          {badge}
        </div>
      )}
    </motion.div>
  );
};

export const PremiumHowItWorks = () => {
  const { t } = useTranslation();
  return (
    <section className="py-32 bg-[#1e3a8a] relative overflow-hidden">
      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#7c3aed] rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">{t('howItWorksTitle', 'From Report To Resolution')}</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium">See how Civic Care transforms civic engagement in 4 simple steps</p>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-between gap-16 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-24 right-24 h-px bg-white/10 -z-0" />
          
          <Step 
            number="1"
            active={true}
            icon={Camera}
            title="Report With Photo"
            description="Snap a photo of the issue. GPS auto-captures location. Our AI handles the rest."
            badge="AI Smart Location"
            delay={0.1}
          />

          <Step 
            number="2"
            active={false}
            icon={Brain}
            title="AI Auto-Dispatch"
            description="Google Gemini analyzes your description and routes to the correct department in < 2 seconds."
            badge="95% Accuracy"
            delay={0.2}
          />

          <Step 
            number="3"
            active={false}
            icon={Users}
            title="Community Validation"
            description="Others can upvote your report. Popular issues get priority response from municipal heads."
            badge="+3k Community Upvotes"
            delay={0.3}
          />

          <Step 
            number="4"
            active={false}
            icon={CheckCircle}
            title="Track Resolution"
            description="Get real-time notifications at every stage: Acknowledged → In Progress → Resolved."
            badge="18h Avg. Resolution"
            delay={0.4}
          />
        </div>

        <div className="mt-24 text-center">
           <button className="h-16 px-12 bg-white text-[#1e3a8a] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-100 transition-all shadow-2xl flex items-center gap-2 mx-auto">
             Get Started Now <ArrowRight size={16} />
           </button>
        </div>
      </div>
    </section>
  );
};

export default PremiumHowItWorks;
