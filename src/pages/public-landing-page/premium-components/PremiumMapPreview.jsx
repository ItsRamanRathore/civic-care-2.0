import React from 'react';
import { motion } from 'framer-motion';
import { Map, Crosshair, Zap, BellRing, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../contexts/LanguageContext';

export const PremiumMapPreview = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content (Value Proposition) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-600 text-[10px] font-black tracking-widest uppercase mb-6 border border-blue-100">
              <Map size={14} />
              {t('liveGeospatialEngine', 'Live Geospatial Engine')}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight leading-tight">
              {t('watchYourCityLabel', 'Watch your city')} <br />
              <span className="text-primary bg-blue-50 px-2 rounded-lg">{t('transformLabel', 'transform')}</span> {t('inRealTimeLabel', 'in real-time.')}
            </h2>
            
            <p className="text-lg text-neutral-500 font-medium mb-10 leading-relaxed">
              {t('interactiveMapSubtitle', 'Our AI-powered interactive map doesn’t just show pins. It predicts anomalies, highlights critical SLAs, and gives you a 10,000-foot view of exactly how your local government is responding to community needs.')}
            </p>

            <div className="flex flex-col gap-5 mb-12">
              {[
                { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50', text: t('featureRealtimeHeatmaps', 'Real-time incident clustering & heatmaps') },
                { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50', text: t('featureSlaBreach', 'Critical SLA breach tracking and escalation') },
                { icon: BellRing, color: 'text-emerald-500', bg: 'bg-emerald-50', text: t('featureProximityAlerts', 'Proximity alerts via offline PWA tracking') }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center shrink-0`}>
                    <feature.icon size={18} className={feature.color} />
                  </div>
                  <span className="font-bold text-neutral-700 text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            <Link to="/interactive-issue-map">
              <Button size="lg" className="bg-primary text-primary-foreground w-full sm:w-auto px-8 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all group font-bold">
                {t('openLiveInteractiveMap', 'Open Live Interactive Map')}
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Right Visual (High-Fidelity Preview Interface) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Soft backdrop glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
            
            <div className="relative bg-slate-100 rounded-[2rem] border border-slate-200 shadow-2xl p-2 h-[500px] overflow-hidden group">
               {/* Browser / App Header Mock */}
               <div className="bg-white rounded-t-[1.5rem] p-3 flex items-center justify-between border-b border-slate-100 shadow-sm z-20 relative">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="px-4 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 rounded-md tracking-wider">
                    MAP.CIVICCARE.GOV.IN
                  </div>
                  <Crosshair size={14} className="text-slate-400" />
               </div>

               {/* Pseudo Map Background */}
               <div className="absolute inset-0 top-[50px] bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-40 mix-blend-luminosity rounded-b-[1.5rem]" />
               <div className="absolute inset-0 top-[50px] bg-sky-100/50 backdrop-blur-[2px] rounded-b-[1.5rem]" />
               
               {/* UI Overlays */}
               <div className="absolute inset-0 top-[50px] p-6 z-10 flex flex-col justify-between">
                  {/* Floating Filter Bar */}
                  <div className="bg-white/90 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-white flex gap-2 w-max animate-float">
                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Critical (12)</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">Resolved (84)</span>
                  </div>

                  {/* Pulsing Map Pins */}
                  <div className="absolute top-[30%] left-[25%] flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 animate-ping absolute" />
                    <div className="w-8 h-8 rounded-full bg-red-500 border-4 border-white shadow-lg flex items-center justify-center text-white relative z-10">
                      <Zap size={14} />
                    </div>
                  </div>

                  <div className="absolute top-[45%] right-[30%] flex flex-col items-center delay-300">
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 animate-ping absolute" />
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-4 border-white shadow-lg relative z-10" />
                    <div className="bg-white font-bold text-[10px] px-2 py-0.5 rounded shadow mt-1 relative z-10">Pothole (Cluster)</div>
                  </div>

                  {/* Map Drawer Mockup */}
                  <div className="bg-white/95 backdrop-blur-md w-full rounded-2xl p-4 shadow-xl border border-white transform translate-y-2 group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Water Main Break</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">2.4 km away • High Priority</p>
                      </div>
                      <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold">ETA: 45m</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[65%] h-full bg-orange-500 rounded-full" />
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PremiumMapPreview;
