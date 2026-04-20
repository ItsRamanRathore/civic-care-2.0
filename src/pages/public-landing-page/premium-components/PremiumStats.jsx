import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TrendingUp, ArrowDown, Users, CheckCircle, BarChart3, Clock } from 'lucide-react';
import landingService from '../../../services/landingService';

const MiniSparkline = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-12 mt-6 opacity-30 hover:opacity-100 transition-opacity">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};

export const PremiumStats = () => {
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

  const StatItem = ({ value, label, trend, trendDir, suffix = '', delay = 0, icon: Icon, colorClass, sparkData, color }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (!loading && value) {
        let start = 0;
        const end = parseInt(value);
        if (start === end) {
          setDisplayValue(end);
          return;
        }
        
        let totalMiliseconds = 2000;
        let timer = setInterval(() => {
          start += 1;
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
        className="flex flex-col items-center text-center p-8 bg-white/50 backdrop-blur-sm rounded-[32px] border border-transparent hover:border-neutral-100 transition-all hover:shadow-2xl group"
      >
        <div className={`p-5 rounded-[24px] ${colorClass} mb-8 transition-transform group-hover:scale-110 shadow-lg`}>
          <Icon size={32} />
        </div>
        <div className="text-4xl font-black text-neutral-900 mb-2 tracking-tight">
          {displayValue.toLocaleString()}{suffix}
        </div>
        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-6">{label}</div>
        
        {/* SVG Sparkline */}
        {sparkData && <MiniSparkline data={sparkData} color={color} />}

        <div className={`mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
          trendDir === 'up' ? 'bg-emerald-50 text-emerald-700' : 
          trendDir === 'down' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
        }`}>
          {trendDir === 'up' ? <TrendingUp size={14} /> : trendDir === 'down' ? <ArrowDown size={14} /> : null}
          {trend}
        </div>
      </motion.div>
    );
  };

  if (loading) return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 bg-white rounded-[40px] border border-neutral-100 shadow-premium p-12 animate-pulse">
           {[1,2,3,4].map(i => <div key={i} className="h-64 bg-neutral-50 rounded-3xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-32 bg-white relative z-20">
      <div className="container mx-auto px-10">
        {/* Section Label */}
        <div className="text-center mb-20 animate-fade-in">
           <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] mb-4 block">Platform Performance</span>
           <h3 className="text-3xl font-black text-neutral-900">Real-Time Impact Metrics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <StatItem 
            icon={BarChart3}
            color="#2563eb"
            colorClass="bg-blue-50 text-[#2563eb]"
            value={stats.totalIssues}
            label="Total Issues Reported"
            trend="+12% this month"
            trendDir="up"
            delay={0.1}
            sparkData={[65, 70, 75, 80, 88, 92, 100]}
          />

          <StatItem 
            icon={CheckCircle}
            color="#059669"
            colorClass="bg-emerald-50 text-[#059669]"
            value={stats.resolutionRate}
            suffix="%"
            label="Resolution Rate"
            trend="72% Overall Avg"
            delay={0.2}
            sparkData={[55, 60, 62, 65, 68, 70, 72]}
          />

          <StatItem 
            icon={Clock}
            color="#ea580c"
            colorClass="bg-orange-50 text-[#ea580c]"
            value={stats.avgResponseTime}
            suffix="hrs"
            label="Avg. Response Time"
            trend="40% faster than SLA"
            trendDir="down"
            delay={0.3}
            sparkData={[100, 90, 85, 75, 65, 60, 52]}
          />

          <StatItem 
            icon={Users}
            color="#7c3aed"
            colorClass="bg-purple-50 text-[#7c3aed]"
            value={stats.activeCitizens}
            label="Active Citizens"
            trend="Growing Daily"
            delay={0.4}
            sparkData={[60, 65, 70, 78, 85, 92, 100]}
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumStats;
