import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, CheckCircle2, AlertCircle, Clock, 
  MapPin, Calendar, Activity, ChevronDown, Check,
  Target, Inbox, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { useCivicIssues } from '../../hooks/useCivicIssues';
import PremiumHeader from '../../components/ui/PremiumHeader';
import PremiumFooter from '../../components/ui/PremiumFooter';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const activeDepartment = localStorage.getItem('demo_target_department') || user?.department_id || user?.department || 'utilities';

  // Load issues specifically related to the department.
  const { 
    issues, 
    loading, 
    error,
    updateIssueStatus 
  } = useCivicIssues({ 
    department: activeDepartment 
  });

  const filteredIssues = (issues || []).filter(issue => {
    const searchMatch = issue?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        issue?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || issue?.status === statusFilter;
    
    // Map the selected department to relevant issue categories
    let categoryMatch = true;
    const category = issue?.category?.toLowerCase() || '';

    if (activeDepartment === 'utilities') {
      categoryMatch = ['water', 'electricity', 'utilities', 'power'].includes(category);
    } else if (activeDepartment === 'roads') {
      categoryMatch = ['roads', 'transport', 'infrastructure', 'traffic'].includes(category);
    } else if (activeDepartment === 'sanitation') {
      categoryMatch = ['sanitation', 'waste', 'garbage'].includes(category);
    } else if (activeDepartment === 'health') {
      categoryMatch = ['health', 'medical', 'hospital'].includes(category);
    } else {
      categoryMatch = category === activeDepartment.toLowerCase();
    }

    return searchMatch && statusMatch && categoryMatch;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case 'resolved': return { label: 'Resolved', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'in_progress': return { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      case 'in_review': return { label: 'In Review', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' };
      case 'submitted': return { label: 'New', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' };
      default: return { label: 'Active', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const response = await updateIssueStatus(issueId, newStatus, `Status updated by Department via Control Panel: ${newStatus.replace('_', ' ')}`);
      if (response && response.success) {
        // Optimistically handled by the hook usually
      } else {
        alert(response?.error?.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const dashboardMetrics = [
    { title: 'Total Assigned', value: filteredIssues?.length || 0, icon: Inbox, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'In Progress', value: filteredIssues?.filter(i => i.status === 'in_progress')?.length || 0, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Resolved', value: filteredIssues?.filter(i => i.status === 'resolved')?.length || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Critical SLA', value: filteredIssues?.filter(i => i.priority === 'critical')?.length || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-body selection:bg-emerald-100 selection:text-emerald-900">
      <PremiumHeader variant="light" />
      
      {/* Immersive Animated Background Blobs for Dept */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 -left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 -right-20 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[120px]" 
        />
      </div>

      <main className="container mx-auto px-4 pt-32 pb-24 relative z-10">
        {/* Welcome Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-white/70 backdrop-blur-3xl p-8 rounded-[48px] border border-white shadow-[0_30px_100px_rgba(0,0,0,0.04)] relative overflow-hidden group"
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #10b981 1px, transparent 1px), linear-gradient(0deg, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-emerald-600 shadow-2xl shadow-emerald-200 flex items-center justify-center text-white font-black group-hover:scale-105 transition-transform duration-500">
                  <Building2 size={36} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-500 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Department Control</span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{activeDepartment.replace('_', ' ')} Hub</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                   Operations Hub
                </h1>
                <p className="text-slate-500 font-medium mt-3 flex items-center gap-2">
                   Manage and resolve civic reports to ensure community well-being.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</div>
                  <div className="text-emerald-600 font-black flex items-center justify-end gap-2 text-sm uppercase">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Responses
                  </div>
               </div>
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
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{metric.title}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{metric.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white/50 backdrop-blur-2xl p-6 rounded-[32px] border border-white shadow-sm flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 w-full space-y-2">
                <div className="relative group">
                    <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search assignments..."
                        className="w-full h-12 bg-white/60 border border-slate-100 rounded-2xl pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all outline-none"
                    />
                </div>
            </div>
            <div className="flex gap-2 bg-slate-50/80 p-1 rounded-2xl border border-slate-100 h-12 overflow-hidden w-full md:w-auto">
                {['all', 'submitted', 'in_progress', 'resolved'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                            "flex-1 md:flex-none px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            statusFilter === status 
                                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-100" 
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>
        </div>

        {/* Management Board */}
        {loading ? (
             <div className="py-24 text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
             </div>
        ) : filteredIssues.length === 0 ? (
            <div className="py-24 text-center bg-white/40 rounded-[48px] border border-dashed border-slate-200">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Inbox size={32} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No Assignments Found</h3>
                 <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">You currently have no active reports matching the defined filters.</p>
            </div>
        ) : (
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <AnimatePresence>
                    {filteredIssues.map((item, index) => {
                        const statusInfo = getStatusInfo(item.status);
                        
                        return (
                            <motion.div
                                key={item.id || item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white/80 backdrop-blur-3xl rounded-[40px] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                <div className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn("px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest", statusInfo.bg, statusInfo.color, statusInfo.border)}>
                                            {statusInfo.label}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">#{String(item.id || item._id).substring(0, 8)}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-tight">{item.title}</h3>
                                    <p className="text-slate-500 font-medium text-sm line-clamp-2 leading-relaxed mb-6">{item.description}</p>
                                    
                                    <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100 mt-auto">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin size={14} className="text-emerald-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest line-clamp-1 max-w-[140px]">{item.location || item.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 ml-auto">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(item.created_at || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 p-6 flex items-center justify-between border-t border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Update Status</span>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="ghost"
                                            onClick={() => handleStatusChange(item.id || item._id, 'in_progress')}
                                            disabled={item.status === 'in_progress'}
                                            className={`h-12 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                item.status === 'in_progress' ? 'bg-amber-100 text-amber-700 opacity-50 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50'
                                            }`}
                                        >
                                            Process
                                        </Button>
                                        <Button 
                                            onClick={() => handleStatusChange(item.id || item._id, 'resolved')}
                                            disabled={item.status === 'resolved'}
                                            className={`h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 ${
                                                item.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/50'
                                            }`}
                                        >
                                            <Check size={14} /> Mark Resolved
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
             </div>
        )}
      </main>

      <PremiumFooter />
    </div>
  );
};

export default DepartmentDashboard;
