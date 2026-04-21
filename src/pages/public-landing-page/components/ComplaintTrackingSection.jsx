import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, CheckCircle, Clock, Brain, User, 
  Construction, Zap, MapPin, FileText, ArrowRight, X, Shield 
} from 'lucide-react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { civicIssueService } from '../../../services/civicIssueService';
import Button from '../../../components/ui/Button';

export const ComplaintTrackingSection = () => {
  const { t } = useTranslation();
  const [complaintId, setComplaintId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const mapIssueToResult = (issue) => {
    const statusMap = {
      submitted: { label: 'Reported', icon: FileText },
      in_review: { label: 'In Review', icon: Clock },
      assigned: { label: 'Assigned to Officer', icon: User },
      in_progress: { label: 'Work In Progress', icon: Construction },
      resolved: { label: 'Resolved', icon: CheckCircle },
      closed: { label: 'Closed', icon: Shield },
      rejected: { label: 'Rejected', icon: X }
    };

    // Construct timeline from updates or just the creation
    let timeline = [];
    
    // Add initial reporting
    timeline.push({
      status: 'Reported',
      time: new Date(issue.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      done: true,
      icon: FileText
    });

    // Add updates
    if (issue.issue_updates && issue.issue_updates.length > 0) {
      const updates = [...issue.issue_updates].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      updates.forEach(update => {
        timeline.push({
          status: statusMap[update.status]?.label || update.status,
          time: new Date(update.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
          done: true,
          icon: statusMap[update.status]?.icon || FileText,
          note: update.comment
        });
      });
    }

    // Add highlighting for the latest step
    if (timeline.length > 0) {
      const lastIdx = timeline.length - 1;
      timeline[lastIdx].highlight = issue.status === 'resolved';
      
      // If it's AI categorized, add a special note to the first/second step
      if (issue.is_ai_categorized && timeline.length > 1) {
        timeline[1].note = `AI ${issue.ai_analysis?.automated_tier || 'Categorized'} in seconds`;
        timeline[1].icon = Brain;
      }
    }

    // Calculate resolution time
    let resolutionTime = '48 hours';
    if (issue.status === 'resolved' && issue.resolved_at) {
      const diff = new Date(issue.resolved_at) - new Date(issue.createdAt);
      const hours = Math.round(diff / (1000 * 60 * 60));
      resolutionTime = `${hours} hours`;
    }

    return {
      id: issue.custom_id || issue._id.toString().toUpperCase().slice(-8),
      fullId: issue._id,
      title: issue.title,
      dept: issue.assigned_department_id?.name || 'Department Pending',
      ward: issue.address.split(',')[0], // Use first part of address as ward/locality
      status: statusMap[issue.status]?.label || issue.status,
      timeline,
      resolutionTime,
      slaTarget: '72 hours'
    };
  };

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!complaintId.trim()) return;

    setIsTracking(true);
    setResult(null);
    setError(null);
    
    try {
      const { data, error: apiError } = await civicIssueService.getIssueById(complaintId.trim().toLowerCase());
      
      if (apiError || !data) {
        setError(t('issueNotFound', 'Complaint ID not found. Please verify the ID and try again.'));
        setIsTracking(false);
        return;
      }

      setResult(mapIssueToResult(data));
    } catch (err) {
      setError(t('systemError', 'Could not connect to the tracking system.'));
      console.error('Tracking system error:', err);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <section className="py-32 bg-neutral-50 relative overflow-hidden">
      {/* Background Dots */}
      <div className="absolute inset-0 bg-dot-grid opacity-5 pointer-events-none" />

      <div className="container mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Content: Search Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-[#2563eb]/10 px-4 py-2 rounded-full text-[#2563eb] text-[10px] font-black tracking-widest uppercase mb-6 border border-blue-100 shadow-sm">
              <Search size={14} />
              {t('intelligentIssueTracker', 'Intelligent Issue Tracker')}
            </div>
            
            <h2 className="text-5xl font-black text-neutral-900 mb-6 leading-tight">
              {t('trackYourComplaint', 'Track Your Complaint in Real-Time')}
            </h2>
            
            <p className="text-xl text-neutral-500 font-medium mb-12 max-w-lg">
              {t('trackComplaintSubtitle', 'Enter your Complaint ID to see real-time status updates, officer comments, and AI-predicted resolution targets.')}
            </p>

            <form onSubmit={handleTrack} className="space-y-6">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#2563eb] transition-colors">
                  <Search size={24} />
                </div>
                <input 
                  type="text" 
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  placeholder="e.g., CC-2024-001"
                  className="w-full h-20 bg-white border-2 border-neutral-100 rounded-2xl pl-16 pr-6 text-xl font-black tracking-tight focus:outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 transition-all shadow-sm group-hover:border-neutral-200 uppercase placeholder:normal-case font-mono"
                />
              </div>

              <Button 
                disabled={isTracking || !complaintId}
                className="w-full h-20 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isTracking ? t('searchingSystem', 'Searching System...') : t('trackNow', 'Track My Issue Now')}
              </Button>
            </form>

            <div className="mt-8 text-center flex items-center justify-center gap-2">
               <p className="text-sm font-bold text-neutral-400">Don't have an ID?</p>
               <button className="text-sm font-black text-[#2563eb] hover:underline flex items-center gap-1 uppercase tracking-widest">
                 Browse Recent Reports <ArrowRight size={14} />
               </button>
            </div>
          </motion.div>

          {/* Right Panel: Reality Preview */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div 
                   key={error ? "error" : "placeholder"}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className={`bg-white rounded-[40px] border border-neutral-100 p-12 shadow-premium text-center min-h-[600px] flex flex-col items-center justify-center border-dashed border-2 ${error ? 'border-red-100 bg-red-50/10' : ''}`}
                >
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${error ? 'bg-red-50 text-red-500' : 'bg-neutral-50 text-neutral-200'}`}>
                    {error ? <X size={48} /> : <Search size={48} />}
                  </div>
                  <h4 className={`text-xl font-black uppercase tracking-widest ${error ? 'text-red-500' : 'text-neutral-400'}`}>
                    {error ? t('notFound', 'Case Not Found') : t('awaitingId', 'Awaiting Case ID')}
                  </h4>
                  <p className="text-neutral-400 font-medium mt-4 max-w-xs">
                    {error || t('trackComplaintInstructions', 'Enter your complaint number on the left to see the live resolution status.')}
                  </p>
                  {error && (
                    <button 
                      onClick={() => { setError(null); setComplaintId(''); }}
                      className="mt-8 text-xs font-black text-[#2563eb] uppercase tracking-widest hover:underline"
                    >
                      Try Again
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                   key="result"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-white rounded-[40px] border border-neutral-100 shadow-2xl overflow-hidden min-h-[600px]"
                >
                  {/* Result Header */}
                  <div className="bg-[#2563eb] p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Shield size={120} />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Live Case Status</p>
                        <h4 className="text-2xl font-black font-mono tracking-tighter">{result.id}</h4>
                      </div>
                      <div className="bg-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {result.status}
                      </div>
                    </div>
                  </div>

                  {/* Result Body */}
                  <div className="p-10">
                    <div className="mb-10">
                      <h5 className="text-xl font-black text-neutral-900 mb-2">{result.title}</h5>
                      <div className="flex items-center gap-3 text-sm font-bold text-neutral-400">
                        <MapPin size={14} className="text-[#2563eb]" />
                        {result.ward} • {result.dept}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-8 mb-10">
                      {result.timeline.map((step, i) => (
                        <div key={i} className="flex gap-6 group">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                              step.highlight ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110' : 
                              step.done ? 'bg-[#2563eb] text-white' : 'bg-neutral-100 text-neutral-400'
                            }`}>
                              <step.icon size={18} />
                            </div>
                            {i < result.timeline.length - 1 && (
                              <div className={`w-0.5 h-10 mt-2 rounded-full ${step.done ? 'bg-[#2563eb]' : 'bg-neutral-100'}`} />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className={`text-sm font-black uppercase tracking-widest ${step.highlight ? 'text-emerald-600' : 'text-neutral-900'}`}>
                              {step.status}
                            </p>
                            <p className="text-[10px] font-black text-neutral-400 mt-1 uppercase tracking-widest opacity-60">
                              {step.time}
                            </p>
                            {step.note && (
                              <div className="mt-3 flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 w-fit">
                                <Zap size={12} className="text-purple-600" />
                                <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">{step.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Success Highlight - Only for Resolved issues */}
                    {result.status === 'Resolved' && (
                      <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 flex items-center gap-5 shadow-sm">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/5">
                          <CheckCircle size={28} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-lg font-black text-emerald-900">Resolved in {result.resolutionTime}!</p>
                          <p className="text-xs font-bold text-emerald-600">This issue was fixed 40% faster than our {result.slaTarget} SLA target.</p>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setResult(null)}
                      className="mt-8 w-full text-center text-xs font-black text-neutral-300 uppercase tracking-[0.3em] hover:text-[#2563eb] transition-colors"
                    >
                      Search Another Case
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decorative Glows */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-[100px] -z-10 opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-100 rounded-full blur-[100px] -z-10 opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComplaintTrackingSection;