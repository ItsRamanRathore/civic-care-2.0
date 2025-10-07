import React from 'react';

import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const IssueCard = ({ issue, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'roads':
        return 'Car';
      case 'sanitation':
        return 'Trash';
      case 'utilities':
        return 'Zap';
      case 'infrastructure':
        return 'Building';
      case 'safety':
        return 'Shield';
      case 'environment':
        return 'Leaf';
      default:
        return 'AlertCircle';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date?.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 120) => {
    if (text?.length <= maxLength) return text;
    return text?.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-modal transition-smooth group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {issue?.issue_images && issue.issue_images.length > 0 ? (
          <Image
            src={issue.issue_images[0].image_url || issue.issue_images[0].image_path}
            alt={issue?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-layout"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x200?text=${encodeURIComponent(issue?.category || 'Issue')}`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center">
              <Icon name={getCategoryIcon(issue?.category)} size={32} className="text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground capitalize">{issue?.category || 'Issue'}</p>
            </div>
          </div>
        )}

        {/* Image Count Badge */}
        {issue?.issue_images && issue.issue_images.length > 1 && (
          <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Icon name="Camera" size={12} />
            {issue.issue_images.length}
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue?.status)}`}>
            {issue?.status?.replace('_', ' ')?.toUpperCase()}
          </span>
        </div>

        {/* Priority Indicator */}
        {issue?.priority && (
          <div className="absolute top-3 left-3">
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue?.priority)} bg-current`} />
          </div>
        )}

        {/* Image Count or Status */}
        {issue?.issue_images && issue.issue_images.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Icon name="Camera" size={12} />
            {issue.issue_images.length}
          </div>
        )}
      </div>
      {/* Content Section */}
      <div className="p-4">
        {/* Category and Date */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name={getCategoryIcon(issue?.category)} size={14} />
            <span className="capitalize">{issue?.category?.replace('_', ' ')}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(issue?.created_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading font-semibold text-lg text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-smooth">
          {issue?.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {truncateText(issue?.description)}
        </p>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Icon name="MapPin" size={14} />
          <span className="truncate">{issue?.address}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Reporter Info */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
              <Icon name="User" size={12} color="white" />
            </div>
            <span className="text-xs text-muted-foreground">
              {issue?.reporter_name || issue?.user_profiles?.full_name || 'Anonymous'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {(issue?.upvoteCount || 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon name="ThumbsUp" size={12} />
                <span>{issue?.upvoteCount}</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails?.(issue)}
              iconName="ExternalLink"
              iconPosition="right"
              iconSize={14}
              className="text-xs"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;