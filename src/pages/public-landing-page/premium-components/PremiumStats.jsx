import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowDown, Users, CheckCircle, BarChart3, Clock } from 'lucide-react';
import landingService from '../../../services/landingService';
import RechartsSparkline from './RechartsSparkline';

const PremiumStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await landingService.getKPIs({ useLiveData: true });
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const StatItem = ({ value, label, trend, trendDir, suffix = '', delay = 0, icon: Icon, color, colorClass, sparkData, gradientId }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (!loading && value) {
        let start = 0;
        const end = parseInt(value);
        if (start === end) {
          setDisplayValue(end);
          return;
        }
        
        let timer = setInterval(() => {
          setDisplayValue(prev => {
             if (prev >= end) {
               clearInterval(timer);
               return end;
             }
             return prev + Math.ceil(end / 100);
          });
        }, 20);

        return () => clearInterval(timer);
      }
    }, [value, loading]);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay }}
        className="flex flex-col items-center text-center p-8 bg-white/40 backdrop-blur-md rounded-[40px] border border-white/20 hover:border-neutral-200 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] group relative overflow-hidden"
      >
        {/* Subtle background glow on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
        />

        <div className={`p-6 rounded-[28px] ${colorClass} mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-xl relative z-10`}>
          <Icon size={36} />
        </div>
        
        <div className="relative z-10">
          <div className="text-5xl font-black text-neutral-900 mb-2 tracking-tight">
            {displayValue.toLocaleString()}{suffix}
          </div>
          <div className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.25em] mb-4">{label}</div>
        </div>
        
        {/* Recharts Area Chart */}
        {sparkData && <RechartsSparkline data={sparkData} color={color} gradientId={gradientId} />}

        <div className={`mt-8 inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase relative z-10 shadow-sm ${
          trendDir === 'up' ? 'bg-emerald-50 text-emerald-700' : 
          trendDir === 'down' ? 'bg-orange-50 text-orange-700' : 'bg-indigo-50 text-indigo-700'
        }`}>
          {trendDir === 'up' ? <TrendingUp size={14} /> : trendDir === 'down' ? <ArrowDown size={14} /> : null}
          {trend}
        </div>
      </motion.div>
    );
  };

  if (loading) return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 p-12">
           {[1,2,3,4].map(i => (
             <div key={i} className="h-80 bg-neutral-50/50 rounded-[40px] border border-neutral-100 animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-32 bg-white relative z-20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-50/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-50/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-10 relative z-10">
        <div className="text-center mb-24">
           <motion.span 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-6 block"
           >
             Platform Intelligence
           </motion.span>
           <motion.h3 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-5xl font-black text-neutral-900 tracking-tight"
           >
             Real-Time Impact Metrics
           </motion.h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <StatItem 
            icon={BarChart3}
            color="#6366f1"
            colorClass="bg-indigo-50 text-indigo-600"
            value={stats.totalIssues}
            label="Total Issues Reported"
            trend="+12.4% this month"
            trendDir="up"
            delay={0.1}
            sparkData={[65, 78, 72, 85, 88, 95, 100]}
            gradientId="gradIssues"
          />

          <StatItem 
            icon={CheckCircle}
            color="#14b8a6"
            colorClass="bg-teal-50 text-teal-600"
            value={stats.resolutionRate}
            suffix="%"
            label="Resolution Efficiency"
            trend="92.1% SLA Compliance"
            delay={0.2}
            sparkData={[60, 62, 68, 65, 70, 75, 72]}
            gradientId="gradResolution"
          />

          <StatItem 
            icon={Clock}
            color="#f97316"
            colorClass="bg-orange-50 text-orange-600"
            value={stats.avgResponseTime}
            suffix="hrs"
            label="Avg. Response Analytics"
            trend="4.2hrs Faster vs 2023"
            trendDir="down"
            delay={0.3}
            sparkData={[100, 95, 88, 82, 70, 65, 52]}
            gradientId="gradTime"
          />

          <StatItem 
            icon={Users}
            color="#a855f7"
            colorClass="bg-purple-50 text-purple-600"
            value={stats.activeCitizens}
            label="Verified Civic Users"
            trend="Growth Index: 1.4x"
            delay={0.4}
            sparkData={[50, 65, 60, 78, 82, 95, 100]}
            gradientId="gradUsers"
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumStats;
