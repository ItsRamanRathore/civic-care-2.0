import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Calendar, MapPin, 
  ChevronRight, ArrowRight, Eye, Info,
  AlertCircle, CheckCircle2, Clock, 
  ArrowUpDown, ArrowUp, ArrowDown,
  LayoutGrid, List as ListIcon, Shield,
  Zap, MessageCircle, BarChart3
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getCivicIssuesByUser } from '../../../services/civicIssueService';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../contexts/LanguageContext';
import { cn } from '../../../utils/cn';

const MyComplaints = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const userComplaints = await getCivicIssuesByUser(user.id);
      setComplaints(userComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOrder = {
    'submitted': 1,
    'in_review': 2,
    'assigned': 3,
    'in_progress': 4,
    'resolved': 5,
    'closed': 6,
    'rejected': 0
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'submitted': return { label: 'Submitted', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Clock, step: 0 };
      case 'in_review': return { label: 'In Review', color: 'text-amber-600', bg: 'bg-amber-50', icon: Search, step: 1 };
      case 'assigned': return { label: 'Assigned', color: 'text-blue-600', bg: 'bg-blue-50', icon: Shield, step: 1 };
      case 'in_progress': return { label: 'Processing', color: 'text-purple-600', bg: 'bg-purple-50', icon: Zap, step: 2 };
      case 'resolved': return { label: 'Resolved', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2, step: 3 };
      case 'closed': return { label: 'Completed', color: 'text-slate-600', bg: 'bg-slate-50', icon: Info, step: 3 };
      case 'rejected': return { label: 'Declined', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle, step: -1 };
      default: return { label: 'Pending', color: 'text-slate-600', bg: 'bg-slate-50', icon: Clock, step: 0 };
    }
  };

  const filteredComplaints = React.useMemo(() => {
    return complaints.filter(complaint => {
      const matchesSearch = searchTerm === '' ||
        (complaint.title && complaint.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (complaint.description && complaint.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (complaint.address && complaint.address.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  const sortedComplaints = React.useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (sortConfig.key === 'status') {
        aValue = statusOrder[aValue] || 0;
        bValue = statusOrder[bValue] || 0;
      }
      if (sortConfig.direction === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
  }, [filteredComplaints, sortConfig]);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-t-indigo-600 rounded-full"
          />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Search and Filters Hub */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100/50 flex flex-col lg:flex-row gap-6 items-end"
      >
        <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Database</label>
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by ID, Title or Location..."
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                />
            </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Filter</label>
                <div className="h-14 min-w-[160px]">
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'submitted', label: 'Submitted' },
                            { value: 'in_progress', label: 'Processing' },
                            { value: 'resolved', label: 'Resolved' }
                        ]}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Layout</label>
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 h-14">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={cn("flex-1 rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={cn("flex-1 rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
                    >
                        <ListIcon size={18} />
                    </button>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Reports Grid */}
      {sortedComplaints.length === 0 ? (
        <div className="py-24 text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Search size={40} />
             </div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No matching reports</h3>
             <p className="text-slate-400 font-medium max-w-xs mx-auto">Try adjusting your filters or search term to find what you're looking for.</p>
        </div>
      ) : (
        <div className={cn(
            "grid gap-8",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        )}>
          {sortedComplaints.map((item, index) => {
            const statusInfo = getStatusInfo(item.status);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/issue/${item.id}`)}
                className="bg-white/50 backdrop-blur-3xl p-8 rounded-[40px] border border-white shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${statusInfo.bg} ${statusInfo.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                            <statusInfo.icon size={22} />
                        </div>
                        <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">#{item.id?.slice(0, 8)}</p>
                             <div className="flex items-center gap-2">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", statusInfo.color)}>{statusInfo.label}</span>
                                {item.priority === 'urgent' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                             </div>
                        </div>
                    </div>
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <ChevronRight size={18} />
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                        {item.description}
                    </p>

                    {/* Status Tracking Pipeline */}
                    <div className="mb-10 pt-2 px-1">
                        <div className="flex justify-between items-center mb-6 px-1">
                            {['Log', 'Rev', 'Act', 'Done'].map((s, i) => (
                                <span key={s} className={cn(
                                    "text-[9px] font-black uppercase tracking-widest transition-colors",
                                    statusInfo.step >= i ? "text-indigo-600" : "text-slate-300"
                                )}>{s}</span>
                            ))}
                        </div>
                        <div className="relative h-2 bg-slate-100 rounded-full p-0.5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(0, (statusInfo.step + 1) / 4 * 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                    "h-full rounded-full",
                                    item.status === 'rejected' ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                                )}
                            />
                            {/* Marker dots */}
                            <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-1">
                                {[0, 1, 2, 3].map(dot => (
                                    <div key={dot} className={cn(
                                        "w-2 h-2 rounded-full border-2 border-white transition-all duration-500",
                                        statusInfo.step >= dot ? "scale-125 bg-indigo-600 ring-2 ring-indigo-100" : "bg-slate-300"
                                    )} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-2 text-slate-400">
                        <MapPin size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest line-clamp-1 max-w-[120px]">{item.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{formatDate(item.created_at)}</span>
                    </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Aggregate Statistics Overview */}
      <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl mt-12">
           <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]" />
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Analytics Hub</p>
                    <h4 className="text-3xl font-black uppercase tracking-tighter">Your Active Metrics</h4>
                </div>
                <div className="flex items-center gap-8">
                     <div className="text-center">
                        <p className="text-4xl font-black tracking-tighter mb-1">{complaints.filter(c => c.status === 'resolved').length}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reports Resolved</p>
                     </div>
                     <div className="w-px h-12 bg-white/10" />
                     <div className="text-center">
                        <p className="text-4xl font-black tracking-tighter mb-1">{complaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Cases</p>
                     </div>
                </div>
                <div className="flex justify-end">
                    <Button variant="outline" className="h-14 px-8 border-white/20 text-white hover:bg-white hover:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                        Download Activity Report
                    </Button>
                </div>
           </div>
      </div>
    </div>
  );
};

export default MyComplaints;
