import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, MapPin, Calendar, 
  ArrowRight, Heart, Share2, MessageCircle,
  LayoutGrid, List as ListIcon, Shield,
  Zap, Droplets, Car, Trash2, AlertCircle,
  TrendingUp, Globe, Users, Info, Rocket, ArrowDown
} from 'lucide-react';
import { getAllCivicIssues } from '../../../services/civicIssueService';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../contexts/LanguageContext';
import { cn } from '../../../utils/cn';

const CommunityComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(4);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      // Add a safety timeout for the fetch
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timed out. Please check your database whitelist.')), 15000)
      );
      
      const response = await Promise.race([getAllCivicIssues(), timeoutPromise]);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setComplaints(response.data || []);
    } catch (err) {
      console.error('Error fetching community complaints:', err);
      setError(err.message || 'The civic intelligence hub is currently unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = (complaints || []).filter(complaint => {
    const title = complaint.title || '';
    const description = complaint.description || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Limit to 4 at a time as requested by USER
  const paginatedComplaints = filteredComplaints.slice(0, visibleCount);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'resolved': return { label: 'Resolved', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'in_progress': return { label: 'Processing', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      case 'in_review': return { label: 'In Review', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' };
      case 'submitted': return { label: 'New', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' };
      case 'closed': return { label: 'Archived', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' };
      default: return { label: 'Active', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'roads': return Car;
      case 'water': return Droplets;
      case 'electricity': return Zap;
      case 'sanitation': return Trash2;
      case 'health': return Shield;
      default: return AlertCircle;
    }
  };

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
      <div className="py-32 text-center flex flex-col items-center">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 border-4 border-indigo-100/30 rounded-full"></div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-t-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"
          />
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2 animate-pulse">Initializing Pulse Hub</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('loadingCommunityComplaints')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-24 px-10 text-center bg-red-50/50 backdrop-blur-xl rounded-[48px] border border-red-100 shadow-2xl max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8 text-red-600 shadow-inner">
           <AlertCircle size={40} />
        </div>
        <h3 className="text-2xl font-black text-red-900 uppercase tracking-tighter mb-4">Connection Interrupted</h3>
        <p className="text-red-700/70 font-medium mb-10 leading-relaxed">
            {error.includes('whitelist') 
              ? "Your current network is not whitelisted to access the Civic Intelligence database. Check your MongoDB Atlas configuration." 
              : error}
        </p>
        <Button 
            onClick={fetchComplaints}
            className="h-14 px-10 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-200"
        >
            Attempt Reconnection
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Search and Filters Hub */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-[0_15px_50px_rgba(0,0,0,0.02)] flex flex-col gap-6"
      >
        <div className="flex flex-col lg:flex-row gap-6 items-end">
            <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('searchCommunityIssues')}</label>
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search community initiatives & reports..."
                        className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:w-auto">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('category')}</label>
                    <div className="h-14 min-w-[140px]">
                        <Select
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            options={[
                                { value: 'all', label: 'All Fields' },
                                { value: 'roads', label: 'Roads' },
                                { value: 'water', label: 'Water' },
                                { value: 'electricity', label: 'Power' },
                                { value: 'sanitation', label: 'Waste' }
                            ]}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('status')}</label>
                    <div className="h-14 min-w-[140px]">
                         <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'resolved', label: 'Resolved' },
                                { value: 'in_progress', label: 'Active' }
                            ]}
                        />
                    </div>
                </div>
                <div className="space-y-2 hidden lg:block">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">View</label>
                    <div className="flex bg-slate-50/80 p-1 rounded-2xl border border-slate-100 h-14 w-full">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={cn("flex-1 rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white text-indigo-600 shadow-md ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600")}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={cn("flex-1 rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white text-indigo-600 shadow-md ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600")}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Results Section */}
      {filteredComplaints.length === 0 ? (
        <div className="py-24 text-center bg-white/40 rounded-[48px] border border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Globe size={32} />
             </div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No Community Reports Found</h3>
             <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">Try adjusting your community filters or widen your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-12">
            <div className={cn(
                "grid gap-8",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" : "grid-cols-1"
            )}>
              {paginatedComplaints.map((item, index) => {
                const statusInfo = getStatusInfo(item.status);
                const CatIcon = getCategoryIcon(item.category);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/70 backdrop-blur-3xl rounded-[48px] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden group flex flex-col h-full"
                  >
                    {/* Visual Header */}
                    <div className="h-24 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 relative overflow-hidden flex items-center px-10">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                         <div className="relative z-10 flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white shadow-xl shadow-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                                    <CatIcon size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40">{item.category} Hub</span>
                            </div>
                            <div className={cn("px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest", statusInfo.bg, statusInfo.color, statusInfo.border)}>
                                {statusInfo.label}
                            </div>
                         </div>
                    </div>

                    <div className="p-10 flex-1 flex flex-col">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-8 leading-relaxed">
                            {item.description}
                        </p>

                        <div className="mt-auto space-y-6">
                            <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <MapPin size={14} className="text-indigo-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest line-clamp-1 max-w-[140px]">{item.location || item.address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 ml-auto">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{formatDate(item.created_at)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-3">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                            <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-400">
                                                {String.fromCharCode(64 + i + index)}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white">
                                        +12
                                    </div>
                                </div>
                                
                                <Link to={`/issue/${item.id}`}>
                                    <Button className="h-12 px-6 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg">
                                        Analyze <ArrowRight size={14} />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination / Load More */}
            {visibleCount < filteredComplaints.length && (
                <div className="flex justify-center pt-4">
                    <Button 
                        onClick={() => setVisibleCount(prev => prev + 4)}
                        className="h-16 px-12 bg-white border-2 border-slate-100 hover:border-indigo-600 text-slate-900 hover:text-indigo-600 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:shadow-indigo-100 transition-all flex items-center gap-3 group"
                    >
                        Load More Insights
                        <ArrowDown size={14} className="group-hover:translate-y-1 transition-transform" />
                    </Button>
                </div>
            )}
        </div>
      )}

      {/* Aggregate Community Footer */}
      {filteredComplaints.length > 0 && (
        <div className="bg-indigo-600 p-10 rounded-[56px] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:scale-125 transition-transform duration-700" />
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="p-6 bg-white/20 backdrop-blur-xl rounded-[32px] animate-bounce-slow">
                    <Rocket size={40} className="text-white" />
                </div>
                <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.4em]">Community Pulse</p>
                    <h4 className="text-3xl font-black uppercase tracking-tighter">Cities are built by citizens.</h4>
                    <p className="text-indigo-50/70 text-sm font-medium leading-relaxed max-w-xl">
                        AI identifies overlapping community concerns to prioritize infrastructure upgrades that benefit the most residents.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="bg-white/10 p-5 rounded-3xl text-center backdrop-blur-md border border-white/10">
                        <p className="text-3xl font-black leading-none mb-1">{filteredComplaints.filter(c => c.status === 'resolved').length}</p>
                        <p className="text-[8px] font-bold text-indigo-100 uppercase tracking-widest">Solutions</p>
                    </div>
                    <div className="bg-white/10 p-5 rounded-3xl text-center backdrop-blur-md border border-white/10">
                        <p className="text-3xl font-black leading-none mb-1">{filteredComplaints.length}</p>
                        <p className="text-[8px] font-bold text-indigo-100 uppercase tracking-widest">Reports</p>
                    </div>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default CommunityComplaints;
