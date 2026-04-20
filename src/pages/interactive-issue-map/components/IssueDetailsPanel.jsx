import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { civicIssueService } from '../../../services/civicIssueService';

const IssueDetailsPanel = ({ issue, onClose, onReportSimilar, onAddToRoute, isInRoute }) => {
  const [upvotes, setUpvotes] = useState(issue?.votes?.upvotes || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (issue?.id) {
      setUpvotes(issue.votes?.upvotes || 0);
      fetchComments();
    }
  }, [issue?.id]);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    const { data } = await civicIssueService.getComments(issue.id);
    if (data) setComments(data);
    setIsLoadingComments(false);
  };

  const handleVote = async () => {
    const { data } = await civicIssueService.voteOnIssue(issue.id);
    if (data) {
      setHasVoted(data.action === 'added');
      setUpvotes(prev => data.action === 'added' ? prev + 1 : prev - 1);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsPostingComment(true);
    const { data, status } = await civicIssueService.addComment(issue.id, newComment);
    if (data) {
      if (status === 'pending') {
        alert('Your comment is under AI review and will appear shortly.');
      } else {
        setComments([data, ...comments]);
      }
      setNewComment('');
    }
    setIsPostingComment(false);
  };

  if (!issue) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
      case 'in-progress':
        return 'bg-orange-100 text-orange-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'roads': return 'Construction';
      case 'sanitation': return 'Trash2';
      case 'utilities': return 'Zap';
      case 'safety': return 'Shield';
      case 'environment': return 'Leaf';
      case 'transport': return 'Bus';
      default: return 'AlertCircle';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="absolute top-0 right-0 w-[420px] h-full bg-white border-l border-gray-100 shadow-2xl z-20 overflow-hidden flex flex-col translate-x-0 transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
          <h3 className="font-bold text-gray-900">Issue Details</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 hover:bg-white shadow-sm ring-1 ring-gray-100">
          <Icon name="X" size={18} />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Issue Image */}
        {issue?.images?.length > 0 && (
          <div className="relative h-56 group overflow-hidden">
            <img src={issue?.images[0]} alt={issue?.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            {issue?.images?.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                +{issue.images.length - 1} PHOTOS
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(issue.status)} shadow-lg`}>
                {issue.status?.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-8">
          {/* Title & Stats */}
          <div className="space-y-3">
            <h4 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">
              {issue.title}
            </h4>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5">
                <Icon name="Hash" size={12} className="text-blue-600" />
                ID: {issue.id?.substring(0, 8)}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="Calendar" size={12} />
                {formatDate(issue.reportedAt || issue.createdAt)}
              </span>
            </div>
          </div>

          {/* Social Actions (Upvote/Share) */}
          <div className="flex items-center gap-3">
            <Button 
              variant={hasVoted ? "default" : "outline"} 
              size="sm" 
              onClick={handleVote}
              className={`flex-1 flex items-center justify-center gap-2 font-bold py-6 rounded-2xl transition-all ${hasVoted ? 'bg-orange-600 border-none scale-[1.02] shadow-orange-200' : 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'}`}
            >
              <Icon name="Flame" size={18} className={hasVoted ? 'animate-bounce' : ''} />
              {upvotes} UPVOTES
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className={`flex-1 flex items-center justify-center gap-2 font-bold py-6 rounded-2xl transition-all ${showComments ? 'bg-blue-600 text-white border-none' : ''}`}
            >
              <Icon name="MessageCircle" size={18} />
              {comments.length} COMMENTS
            </Button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-3xl bg-gray-50/80 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</p>
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <div className="p-1.5 rounded-lg bg-white shadow-sm ring-1 ring-gray-100">
                  <Icon name={getCategoryIcon(issue.category)} size={14} className="text-blue-600" />
                </div>
                {issue.category?.toUpperCase()}
              </div>
            </div>
            <div className="p-4 rounded-3xl bg-gray-50/80 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority</p>
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <div className="p-1.5 rounded-lg bg-white shadow-sm ring-1 ring-gray-100">
                  <Icon name="ShieldAlert" size={14} className={issue.priority === 'critical' ? 'text-red-600' : 'text-orange-500'} />
                </div>
                {issue.priority?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident Description</p>
            <p className="text-gray-600 leading-relaxed font-medium">
              {issue.description}
            </p>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Localized at</p>
            <div className="flex items-start gap-3 p-5 rounded-3xl bg-blue-50/30 border border-blue-100/50">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm ring-1 ring-blue-100 flex items-center justify-center shrink-0">
                <Icon name="MapPin" size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-snug">{issue.address}</p>
                <p className="text-xs text-blue-600/70 font-mono mt-1 font-bold">
                  {issue.coordinates?.lat?.toFixed(6)}, {issue.coordinates?.lng?.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Comments Section (Expandable) */}
          {showComments && (
            <div className="space-y-6 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-5 duration-300">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Community Discussion</p>
                <Button variant="ghost" size="sm" onClick={fetchComments} className="text-[10px] h-6 px-2">REFRESH</Button>
              </div>
              
              {/* Comment Input */}
              <div className="relative group">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your perspective..."
                  className="w-full bg-gray-50 border-none rounded-3xl p-5 pr-14 text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all resize-none min-h-[100px]"
                />
                <button 
                  onClick={handlePostComment}
                  disabled={isPostingComment || !newComment.trim()}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                >
                  {isPostingComment ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
                </button>
              </div>

              {/* Comment List */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingComments ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
                    <Icon name="Loader2" size={24} className="animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest">Syncing discussion...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="MessagesSquare" size={24} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No comments yet</p>
                    <p className="text-[10px] mt-1 font-medium">Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment._id} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center shrink-0">
                        <Icon name="User" size={14} className="text-blue-600" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-gray-900">{comment.user_id?.full_name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{formatDate(comment.createdAt).split(',')[0]}</p>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">{comment.text}</p>
                        {comment.user_id?.badges?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {comment.user_id.badges.map(b => (
                              <span key={b} className="px-1.5 py-0.5 rounded bg-amber-100 text-[8px] font-black text-amber-700 uppercase">{b}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Action Footer */}
      <div className="p-6 bg-white border-t border-gray-100 space-y-3">
        <Button
          variant={isInRoute ? "outline" : "default"}
          fullWidth
          className={`h-14 rounded-2xl font-black tracking-widest text-[10px] transition-all transform active:scale-95 ${isInRoute ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100'}`}
          onClick={() => onAddToRoute(issue)}
          disabled={isInRoute}
          iconName={isInRoute ? "Check" : "Navigation"}
          iconSize={18}
        >
          {isInRoute ? "IN INSPECTION ROUTE" : "ADD TO ROUTE"}
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-black tracking-widest" onClick={() => onReportSimilar(issue)}>DUPLICATE</Button>
          <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-black tracking-widest" onClick={() => {
            navigator.share?.({ title: issue.title, text: issue.description, url: window.location.href });
          }}>SHARE</Button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsPanel;