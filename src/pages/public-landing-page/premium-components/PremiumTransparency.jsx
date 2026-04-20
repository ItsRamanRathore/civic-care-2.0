import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BarChart3, TrendingUp, Star } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../contexts/LanguageContext';

const KPICard = ({ label, value, trend, positive, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm"
    >
      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-4xl font-black mb-4 ${positive ? 'text-[#059669]' : 'text-[#2563eb]'}`}>{value}</p>
      
      {/* Sparkline simulation */}
      <div className="h-12 w-full flex items-end gap-1 mb-4">
        {[40, 55, 45, 60, 50, 75, 72].map((h, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-t-sm ${positive ? 'bg-emerald-100' : 'bg-blue-100'}`} 
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <div className={`text-[10px] font-black uppercase tracking-widest ${positive ? 'text-emerald-600' : 'text-blue-600'}`}>
        {trend}
      </div>
    </motion.div>
  );
};

export const PremiumTransparency = () => {
  const { t } = useTranslation();
  return (
    <section className="py-32 bg-stone-50/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#2563eb]/10 text-[#2563eb] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <Shield size={14} /> Open Data Initiative
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-neutral-900 mb-6">{t('transparencyTitle', 'Full Transparency, ')} <span className="text-[#2563eb]">{t('transparencyHighlight', 'Zero Excuses')}</span></h2>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto font-medium">
            Every metric, every department, every ward—tracked in real-time and available to the public.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
            <button className="px-8 py-3 bg-[#2563eb] text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">Performance</button>
            <button className="px-8 py-3 bg-white text-neutral-400 rounded-full font-black text-[10px] uppercase tracking-widest hover:text-neutral-600">Budget Utilization</button>
            <button className="px-8 py-3 bg-white text-neutral-400 rounded-full font-black text-[10px] uppercase tracking-widest hover:text-neutral-600">Department Rankings</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <KPICard 
              label="Overall Resolution Rate"
              value="72%"
              trend="↑ +5% vs last month"
              positive={true}
              delay={0.1}
            />
            <KPICard 
              label="Avg. Resolution Time"
              value="18hrs"
              trend="↓ 40% faster than SLA"
              positive={false}
              delay={0.2}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Citizen Satisfaction</p>
                <p className="text-4xl font-black text-[#ea580c] mb-6">4.6/5</p>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4].map(i => <Star key={i} size={20} fill="#ea580c" className="text-[#ea580c]" />)}
                  <Star size={20} fill="#fed7aa" className="text-[#fed7aa]" />
                </div>
              </div>
              <p className="text-xs font-bold text-neutral-400">Based on 12,847 verified reviews across all wards</p>
            </motion.div>
          </div>

          <div className="text-center">
             <Button size="lg" className="bg-[#2563eb] text-white px-10 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl">
                <BarChart3 className="mr-2" size={18} /> Explore Full Transparency Portal
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumTransparency;
