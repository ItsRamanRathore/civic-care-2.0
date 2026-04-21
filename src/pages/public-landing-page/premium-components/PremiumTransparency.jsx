import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BarChart3, TrendingUp, Star } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../contexts/LanguageContext';

const KPICard = ({ label, value, trend, positive, delay, color, sparkData, gradientId }) => {
  const chartData = (sparkData || [40, 55, 45, 60, 50, 75, 72]).map((val, i) => ({ val, i }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      className="bg-white p-10 rounded-[48px] border border-neutral-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden"
    >
      <div className="relative z-10">
        <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-3">{label}</p>
        <p className="text-5xl font-black mb-6 tracking-tight" style={{ color }}>{value}</p>
        
        {/* Modern Recharts Sparkline */}
        <div className="h-20 w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/90 backdrop-blur-md border border-neutral-100 shadow-xl rounded-lg px-2 py-1 text-[10px] font-bold">
                        {payload[0].value}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke={color}
                strokeWidth={3}
                fill={`url(#${gradientId})`}
                animationDuration={2000}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-neutral-50" style={{ color }}>
          <TrendingUp size={14} />
          {trend}
        </div>
      </div>

      {/* Decorative corner element */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none rounded-full"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />
    </motion.div>
  );
};

export const PremiumTransparency = () => {
  const { t } = useTranslation();
  return (
    <section className="py-40 bg-[#fafafa] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="container mx-auto px-10 relative z-10">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-600 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-10"
          >
            <Shield size={16} className="mr-1" /> Open Data Initiative
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-black text-neutral-900 mb-8 tracking-tighter"
          >
            {t('transparencyTitle', 'Full Transparency, ')} <span className="text-indigo-600">{t('transparencyHighlight', 'Zero Excuses')}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-neutral-500 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Every metric, every department, every ward—tracked in real-time and available to the public. 
            We believe in radical accountability.
          </motion.p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-6 mb-16 overflow-x-auto pb-4 no-scrollbar">
            <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(79,70,229,0.3)] hover:translate-y-[-2px] transition-all">Performance</button>
            <button className="px-10 py-4 bg-white text-neutral-400 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:text-neutral-900 border border-neutral-100 hover:border-neutral-200 transition-all">Budget Utilization</button>
            <button className="px-10 py-4 bg-white text-neutral-400 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:text-neutral-900 border border-neutral-100 hover:border-neutral-200 transition-all">Department Rankings</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
            <KPICard 
              label="Overall Resolution Rate"
              value="72.4%"
              trend="↑ +5.2% vs last month"
              positive={true}
              delay={0.1}
              color="#14b8a6"
              gradientId="gradTrans1"
              sparkData={[45, 52, 48, 60, 58, 70, 72.4]}
            />
            <KPICard 
              label="Avg. Resolution Time"
              value="18.2hrs"
              trend="↓ 42% faster than SLA"
              positive={false}
              delay={0.2}
              color="#f97316"
              gradientId="gradTrans2"
              sparkData={[85, 78, 72, 65, 50, 42, 38]}
            />
            <motion.div 
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.7, delay: 0.3 }}
               className="bg-white p-10 rounded-[48px] border border-neutral-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)] transition-all duration-500 group flex flex-col justify-between"
            >
              <div>
                <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-3">Citizen Satisfaction</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <p className="text-5xl font-black text-[#f59e0b] tracking-tight">4.6</p>
                  <span className="text-xl font-bold text-neutral-300">/ 5.0</span>
                </div>
                <div className="flex gap-1.5 mb-6">
                  {[1,2,3,4].map(i => <Star key={i} size={24} fill="#f59e0b" className="text-[#f59e0b]" />)}
                  <div className="relative">
                    <Star size={24} fill="#e5e7eb" className="text-[#e5e7eb]" />
                    <div className="absolute inset-0 overflow-hidden w-[60%]">
                      <Star size={24} fill="#f59e0b" className="text-[#f59e0b]" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-neutral-400 leading-relaxed border-t border-neutral-50 pt-6">Based on <span className="text-neutral-900">12,847 verified reviews</span> across all wards</p>
            </motion.div>
          </div>

          <div className="text-center">
             <motion.div
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
             >
               <Button size="lg" className="bg-indigo-600 text-white px-14 h-20 rounded-[28px] font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_20px_50px_rgba(79,70,229,0.3)] border-0">
                  <BarChart3 className="mr-3" size={20} /> Explore Full Transparency Portal
               </Button>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumTransparency;
