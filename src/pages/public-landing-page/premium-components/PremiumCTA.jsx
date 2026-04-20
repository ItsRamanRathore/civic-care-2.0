import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Play, CheckCircle, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

export const PremiumCTA = () => {
  return (
    <section className="py-32 bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] relative overflow-hidden text-white">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />
        <motion.div 
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#7c3aed]/20 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 10 }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
              Ready to Transform Your City?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-xl font-medium leading-relaxed">
              Join 10,000+ active citizens making a real difference. Report your 
              first issue in under 60 seconds with AI-powered tagging.
            </p>

            <div className="flex flex-col gap-6 mb-12">
              <div className="flex items-center gap-4">
                <CheckCircle className="text-[#06b6d4]" />
                <span className="text-lg font-bold">Free Forever for Citizens</span>
              </div>
              <div className="flex items-center gap-4">
                <Shield className="text-[#06b6d4]" />
                <span className="text-lg font-bold">Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-4">
                <Zap className="text-[#06b6d4]" />
                <span className="text-lg font-bold">AI-Powered Automation</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/issue-reporting-form">
                <Button size="xl" className="bg-white text-[#2563eb] hover:bg-neutral-100 transition-all font-black uppercase tracking-widest text-[10px] px-10 h-16 rounded-2xl shadow-2xl">
                  <Camera className="mr-2" size={20} />
                  Report Your First Issue
                </Button>
              </Link>
              <Link to="/faq">
                <Button variant="outline" size="xl" className="border-white/40 text-white hover:bg-white/10 font-bold px-10 h-16 rounded-2xl">
                  <Play className="mr-2" size={20} fill="currentColor" />
                  Watch 2-Min Demo
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-2">
                   {[1,2,3,4,5,6,7].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-[#2563eb] bg-white overflow-hidden shadow-sm">
                       <img src={`https://i.pravatar.cc/100?u=cta-${i}`} alt="avatar" />
                     </div>
                   ))}
                </div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                  Join <strong className="text-white">2,847 citizens</strong> this week
                </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:justify-end"
          >
             {/* Phone Mockup Simulation */}
             <div className="relative w-[300px] h-[600px] bg-neutral-900 rounded-[3rem] p-3 shadow-2xl border-4 border-white/10">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-900 rounded-b-2xl z-10" />
                
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                   <div className="p-6 bg-blue-600 text-white pb-12">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">New Report</p>
                      <h4 className="text-xl font-bold">Report Pothole</h4>
                   </div>
                   <div className="p-6 -mt-8">
                      <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-neutral-100">
                         <div className="aspect-square bg-neutral-100 rounded-xl mb-4 flex items-center justify-center">
                            <Camera size={32} className="text-neutral-300" />
                         </div>
                         <div className="h-4 w-3/4 bg-neutral-100 rounded mb-2" />
                         <div className="h-4 w-1/2 bg-neutral-100 rounded" />
                      </div>
                      <div className="w-full h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                        Submit Issue
                      </div>
                   </div>
                </div>
                
                {/* Floating Rating Badge */}
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-3xl shadow-2xl ring-1 ring-neutral-100">
                   <p className="text-2xl font-black text-neutral-900">4.8★</p>
                   <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">App Rating</p>
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PremiumCTA;
