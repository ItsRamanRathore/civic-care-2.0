import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, ThumbsUp, Clock, Construction, Lightbulb, 
  Droplets, Shield, Brain, Zap, Camera, Search, ArrowRight 
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import { civicIssueService } from '../../../services/civicIssueService';

const DEMO_REPORTS = [
  {
    id: 'CC-2024-001',
    title: 'Large pothole causing vehicle damage near Market Street',
    category: 'Pothole',
    categoryIcon: Construction,
    categoryColor: 'bg-orange-50 text-orange-700 border-orange-100',
    status: 'In Progress',
    statusColor: 'bg-blue-50 text-blue-700 border-blue-100',
    priority: 'High',
    priorityColor: 'bg-red-50 text-red-700 border-red-100',
    location: 'Ward 12, Market Street',
    reporter: 'Rahul Sharma',
    upvotes: 23,
    timeAgo: '2 hours ago',
    thumbnail: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&q=80&w=400',
    aiRouted: 'Roads Dept'
  },
  {
    id: 'CC-2024-002',
    title: 'Street light non-functional creating safety hazard',
    category: 'Streetlight',
    categoryIcon: Lightbulb,
    categoryColor: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    status: 'Resolved',
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    priority: 'Medium',
    priorityColor: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    location: 'Ward 7, Gandhi Nagar',
    reporter: 'Priya Mehta',
    upvotes: 15,
    timeAgo: '5 hours ago',
    aiRouted: 'Electrical Dept'
  },
  {
    id: 'CC-2024-003',
    title: 'Water pipeline leakage flooding residential area',
    category: 'Water',
    categoryIcon: Droplets,
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-100',
    status: 'Critical',
    statusColor: 'bg-red-50 text-red-700 border-red-100',
    priority: 'Critical',
    priorityColor: 'bg-red-600 text-white border-red-600',
    location: 'Ward 3, Nehru Colony',
    reporter: 'Anil Verma',
    upvotes: 47,
    timeAgo: '30 minutes ago',
    aiRouted: 'Water Dept'
  }
];

const ReportCard = ({ report, delay }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onClick={() => navigate(`/issue/${report.id}`)}
      className="bg-white rounded-3xl border border-neutral-100 p-6 hover:shadow-2xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Header Badges */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-wrap gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${report.categoryColor}`}>
            <report.categoryIcon size={12} />
            {report.category}
          </span>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${report.priorityColor}`}>
            {report.priority}
          </span>
        </div>
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${report.statusColor}`}>
          {report.status}
        </span>
      </div>

      {/* Content */}
      <p className="text-[10px] font-black text-neutral-400 font-mono mb-2 tracking-widest uppercase">{report.id}</p>
      <h4 className="text-lg font-black text-neutral-900 mb-3 group-hover:text-[#2563eb] transition-colors line-clamp-2 leading-tight">
        {report.title}
      </h4>

      <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 mb-6">
        <MapPin size={14} className="text-[#2563eb]" />
        {report.location}
      </div>

      {/* AI Dispatch Signal */}
      <div className="bg-neutral-50 rounded-2xl p-4 mb-6 flex items-center gap-3 border border-neutral-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <Brain size={16} className="text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">AI Intelligent Routing</p>
          <p className="text-xs font-black text-neutral-900">Dispatched to {report.aiRouted}</p>
        </div>
        <Zap size={14} className="text-purple-500 animate-pulse" />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-neutral-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-black text-[10px] text-neutral-400 border border-white">
            {report.reporter.charAt(0)}
          </div>
          <span className="text-xs font-bold text-neutral-600">{report.reporter}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
            <ThumbsUp size={14} />
            {report.upvotes}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
            <Clock size={14} />
            {report.timeAgo}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RecentReportsSection = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const { data } = await civicIssueService.getIssues({ limit: 3 });
        if (data && data.length > 0) {
          // Map backend data to our premium structure
          const mapped = data.map(r => ({
             id: r.id,
             title: r.title,
             category: r.category || 'General',
             categoryIcon: Construction,
             categoryColor: 'bg-blue-50 text-blue-700 border-blue-100',
             status: r.status || 'Reported',
             statusColor: 'bg-neutral-50 text-neutral-700 border-neutral-100',
             priority: r.priority || 'Medium',
             priorityColor: 'bg-neutral-50 text-neutral-700 border-neutral-100',
             location: r.address || 'Location Hidden',
             reporter: 'Citizen',
             upvotes: r.upvoteCount || 0,
             timeAgo: 'Recently',
             aiRouted: 'Review Dept'
          }));
          setReports(mapped);
        } else {
          setReports(DEMO_REPORTS);
        }
      } catch (e) {
        setReports(DEMO_REPORTS);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  return (
    <section className="py-32 bg-white relative">
      {/* Background Decorative */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-[#2563eb] text-[10px] font-black tracking-widest uppercase mb-6">
              <Camera size={14} />
              Community Updates
            </div>
            <h2 className="text-5xl font-black text-neutral-900 mb-6 leading-tight">
              Evidence-Based <span className="text-[#2563eb]">Accountability</span>
            </h2>
            <p className="text-xl text-neutral-500 font-medium max-w-lg">
              Transparent, real-time monitoring of civic reports across your neighborhood.
            </p>
          </div>

          <Button 
            onClick={() => navigate('/public-reports-listing')}
            variant="outline"
            className="h-16 px-8 rounded-2xl border-2 border-neutral-100 font-black uppercase tracking-widest text-xs hover:border-blue-200 transition-all gap-3"
          >
            All Live Reports <ArrowRight size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {reports.map((report, index) => (
            <ReportCard key={report.id} report={report} delay={index * 0.1} />
          ))}
        </div>

        {/* Floating Background Hint */}
        <div className="mt-24 text-center">
           <div className="inline-flex flex-col sm:flex-row items-center gap-6 sm:gap-12 bg-neutral-50 px-6 sm:px-10 py-6 rounded-[32px] border border-neutral-100 shadow-sm w-full md:w-auto">
             <div className="flex items-center gap-4">
                <Search size={20} className="text-neutral-400" />
                <span className="text-sm font-bold text-neutral-500">Search 12,847 archived cases</span>
             </div>
             <div className="w-px h-8 bg-neutral-200 hidden md:block" />
             <div className="hidden md:flex items-center gap-4">
                <Shield size={20} className="text-neutral-400" />
                <span className="text-sm font-bold text-neutral-500">Verified by local authorities</span>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default RecentReportsSection;