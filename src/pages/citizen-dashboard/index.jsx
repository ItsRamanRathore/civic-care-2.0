import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, MapPin, Award, Clock, CheckCircle2, 
  FileText, Users, Settings, Plus, Search, 
  Globe, Info, ArrowRight, Star, TrendingUp,
  Zap, Trophy, Medal, LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import PremiumHeader from '../../components/ui/PremiumHeader';
import PremiumFooter from '../../components/ui/PremiumFooter';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { civicIssueService } from '../../services/civicIssueService';

const CitizenDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('community') ? 'community' : 
    location.pathname.includes('settings') ? 'settings' : 'personal'
  );
  
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0, reputation: 740 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await civicIssueService.getCivicIssuesByUser(user.id);
        if (data) {
          const total = data.length;
          const resolved = data.filter(i => i.status === 'resolved').length;
          const inProgress = data.filter(i => ['assigned', 'in_progress', 'in_review'].includes(i.status)).length;
          setStats(prev => ({ ...prev, total, resolved, inProgress }));
        }
      } catch (err) {
        console.error('Failed to fetch citizen stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  const dashboardMetrics = [
    { 
      title: t('totalIssues', 'Total Reports'), 
      value: stats.total, 
      icon: FileText, 
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      description: 'Your contribution'
    },
    { 
      title: t('resolved', 'Resolved'), 
      value: stats.resolved, 
      icon: CheckCircle2, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      description: 'Impact made'
    },
    { 
      title: t('inProgress', 'Active'), 
      value: stats.inProgress, 
      icon: Clock, 
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      description: 'Being handled'
    },
    { 
      title: t('reputation', 'Reputation'), 
      value: stats.reputation, 
      icon: Trophy, 
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Elite status'
    }
  ];

  const tabs = [
    { id: 'personal', label: t('myComplaints', 'My Reports'), path: '/citizen-dashboard', icon: UserIcon },
    { id: 'community', label: t('communityComplaints', 'Feed'), path: '/citizen-dashboard/community', icon: Users },
    { id: 'settings', label: 'Preferences', path: '/citizen-dashboard/settings', icon: Settings }
  ];

  const reputationProgress = (stats.reputation / 1000) * 100;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-body selection:bg-indigo-100 selection:text-indigo-900">
      <PremiumHeader variant="light" />
      
      {/* Immersive Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 -left-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 -right-20 w-[30rem] h-[30rem] bg-purple-500/5 rounded-full blur-[120px]" 
        />
      </div>

      <main className="container mx-auto px-4 pt-32 pb-24 relative z-10">
        {/* Welcome Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-white/70 backdrop-blur-3xl p-8 rounded-[48px] border border-white shadow-[0_30px_100px_rgba(0,0,0,0.04)] relative overflow-hidden group"
        >
          {/* Subtle line background element */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #6366f1 1px, transparent 1px), linear-gradient(0deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-200 flex items-center justify-center text-white font-black text-3xl group-hover:scale-105 transition-transform duration-500">
                  {user?.full_name?.charAt(0) || 'C'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Verified Citizen</span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Level 4 Contributor</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  {t('welcomeBack')}, {user?.full_name?.split(' ')[0] || 'Citizen'}
                </h1>
                <p className="text-slate-500 font-medium mt-3 flex items-center gap-2">
                   <Globe size={16} className="text-indigo-400" />
                   Active in {user?.city || 'Your Community'} • {stats.total} Issues Reported since joining
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/issue-reporting-form">
                <Button className="h-16 px-10 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black tracking-widest text-xs uppercase transition-all shadow-[0_20px_40px_rgba(79,70,229,0.2)] flex items-center gap-3">
                  <Plus size={20} />
                  Report New Incident
                </Button>
              </Link>
              <Button 
                variant="ghost"
                onClick={signOut}
                className="h-16 px-8 border-2 border-slate-100 hover:border-red-500 hover:text-red-500 rounded-2xl font-black tracking-widest text-xs uppercase transition-all flex items-center gap-3 bg-white"
              >
                <LogOut size={20} />
                Sign Out
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {dashboardMetrics.map((metric, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="bg-white/80 backdrop-blur-3xl p-8 rounded-[40px] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)] group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${metric.bg} ${metric.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <metric.icon size={24} />
                </div>
                <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center">
                   <TrendingUp size={16} className="text-slate-300" />
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{metric.title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{metric.value}</h3>
                <span className="text-xs font-bold text-slate-400">{metric.description}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Reports Hub */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="bg-white/80 backdrop-blur-3xl rounded-[48px] border border-white shadow-[0_40px_80px_rgba(0,0,0,0.03)] overflow-hidden">
              {/* Specialized Tab Navigation */}
              <div className="p-4 bg-slate-50/50 flex flex-wrap gap-2 border-b border-slate-100">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.path !== location.pathname) navigate(tab.path);
                    }}
                    className={cn(
                      'flex items-center gap-3 py-4 px-8 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300',
                      activeTab === tab.id
                        ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-50 translate-y-0.5'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                    )}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Quick Action Cards Under Main List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/interactive-issue-map" className="group p-8 rounded-[40px] bg-slate-900 text-white shadow-2xl relative overflow-hidden h-64 flex flex-col justify-end">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-700" />
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-Auto">
                        <MapPin size={28} className="text-indigo-400" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">Neighborhood Map</h4>
                        <p className="text-slate-400 text-sm font-medium mb-6">Explore real-time reports around you</p>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                            Open Map <ArrowRight size={14} />
                        </div>
                    </div>
                </Link>
                <div className="p-8 rounded-[40px] bg-indigo-600 text-white shadow-2xl relative overflow-hidden h-64 flex flex-col justify-end group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-700" />
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-Auto">
                        <Zap size={28} className="text-yellow-400" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">AI City Insight</h4>
                        <p className="text-indigo-100 text-sm font-medium mb-6">View predictions and optimization reports</p>
                        <Link to="/analytics-dashboard" className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest">
                            View Insights <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: Sidebar Experience */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Premium Civic Reputation Gauge */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white/80 backdrop-blur-3xl p-10 rounded-[56px] shadow-[0_30px_100px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center text-center relative overflow-hidden"
            >
               <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-50 rounded-full blur-[40px] -z-10" />
               
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Civic Reputation</h3>
               
               <div className="relative w-48 h-48 mb-8">
                  {/* Outer Ring */}
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <motion.circle 
                        cx="96" cy="96" r="88" fill="none" stroke="url(#gradient)" strokeWidth="12" 
                        strokeDasharray="552.92"
                        initial={{ strokeDashoffset: 552.92 }}
                        animate={{ strokeDashoffset: 552.92 - (552.92 * reputationProgress / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{stats.reputation}</span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Points</span>
                  </div>
               </div>

               <div className="bg-indigo-50/50 p-6 rounded-3xl w-full">
                  <div className="flex justify-between items-center mb-3 px-2">
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Level 04</span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">260 To Level 05</span>
                  </div>
                  <div className="h-2.5 bg-white rounded-full overflow-hidden mb-4 p-0.5 border border-indigo-50">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${reputationProgress}%` }}
                        className="h-full bg-indigo-600 rounded-full" 
                     />
                  </div>
                  <div className="flex justify-between gap-1 overflow-x-auto pb-2 scrollbar-hide">
                     <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex-1 min-w-[60px]">
                        <Trophy size={16} className="mx-auto text-amber-500 mb-1" />
                        <span className="text-[8px] font-bold text-slate-900 block">Elite</span>
                     </div>
                     <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex-1 min-w-[60px]">
                        <Medal size={16} className="mx-auto text-indigo-500 mb-1" />
                        <span className="text-[8px] font-bold text-slate-900 block">Veteran</span>
                     </div>
                     <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex-1 min-w-[60px]">
                        <Star size={16} className="mx-auto text-purple-500 mb-1" />
                        <span className="text-[8px] font-bold text-slate-900 block">Expert</span>
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* AI Contribution Insight */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[56px] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                        <Zap size={24} className="text-white" />
                     </div>
                     <div>
                        <h4 className="text-lg font-black uppercase tracking-tight">Governance Contribution</h4>
                     </div>
                  </div>
                  <p className="text-indigo-100/80 text-sm font-medium mb-8 leading-relaxed">
                     Higher reputation unlocks priority reporting and direct access to city department heads through the AI Executive portal.
                  </p>
                  <div className="space-y-4">
                     {[
                        { label: 'Priority Handling', unlocked: true },
                        { label: 'Direct Messaging', unlocked: false },
                        { label: 'Policy Voting', unlocked: false }
                     ].map((perk, i) => (
                        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${perk.unlocked ? 'bg-white/10 border-white/20' : 'bg-black/10 border-transparent opacity-50'}`}>
                           <span className="text-xs font-bold uppercase tracking-widest">{perk.label}</span>
                           {perk.unlocked ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Clock size={16} />}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
};

// Sub-icon components for consistent sizing
const UserIcon = ({ size, className }) => <Shield size={size} className={className} />;

export default CitizenDashboard;

