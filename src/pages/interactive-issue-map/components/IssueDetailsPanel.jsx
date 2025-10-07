import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const IssueDetailsPanel = ({ issue, onClose, onReportSimilar }) => {
  if (!issue) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-accent text-accent-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'roads':
        return 'Construction';
      case 'sanitation':
        return 'Trash2';
      case 'utilities':
        return 'Zap';
      case 'safety':
        return 'Shield';
      case 'environment':
        return 'Leaf';
      case 'transport':
        return 'Bus';
      default:
        return 'AlertCircle';
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
    <div className="absolute top-0 right-0 w-96 h-full bg-card border-l border-border shadow-modal z-20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        <h3 className="font-medium text-card-foreground">Issue Details</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <Icon name="X" size={16} />
        </Button>
      </div>
      {/* Content */}
      <div className="h-full overflow-y-auto pb-20">
        {/* Issue Image */}
        {issue?.images && issue?.images?.length > 0 && (
          <div className="relative h-48 bg-muted">
            <Image
              src={issue?.images?.[0]}
              alt={issue?.title}
              className="w-full h-full object-cover"
            />
            {issue?.images?.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                +{issue?.images?.length - 1} more
              </div>
            )}
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Title and Status */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-card-foreground text-lg leading-tight">
                {issue?.title}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue?.status)}`}>
                {issue?.status?.replace('-', ' ')?.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Issue #{issue?.id}
            </p>
          </div>

          {/* Category and Priority */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name={getCategoryIcon(issue?.category)} size={16} className="text-primary" />
              <span className="text-sm text-card-foreground capitalize">
                {issue?.category?.replace('-', ' ')}
              </span>
            </div>
            {issue?.priority && (
              <div className="flex items-center space-x-1">
                <Icon 
                  name="AlertTriangle" 
                  size={14} 
                  className={issue?.priority === 'high' ? 'text-accent' : 'text-warning'} 
                />
                <span className="text-sm text-muted-foreground capitalize">
                  {issue?.priority} Priority
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h5 className="font-medium text-card-foreground mb-2">Description</h5>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {issue?.description}
            </p>
          </div>

          {/* Location */}
          <div>
            <h5 className="font-medium text-card-foreground mb-2">Location</h5>
            <div className="flex items-start space-x-2">
              <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-card-foreground">{issue?.address}</p>
                {issue?.coordinates && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-card-foreground mb-1">📍 GPS Coordinates</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {issue?.coordinates?.lat?.toFixed(6)}, {issue?.coordinates?.lng?.toFixed(6)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard?.writeText(`${issue?.coordinates?.lat?.toFixed(6)}, ${issue?.coordinates?.lng?.toFixed(6)}`);
                            // You could add a toast notification here
                          }}
                          className="h-6 w-6 p-0"
                          title="Copy coordinates"
                        >
                          <Icon name="Copy" size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.open(`https://www.google.com/maps?q=${issue?.coordinates?.lat},${issue?.coordinates?.lng}`, '_blank');
                          }}
                          className="h-6 w-6 p-0"
                          title="Open in Google Maps"
                        >
                          <Icon name="ExternalLink" size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reporter Information */}
          <div>
            <h5 className="font-medium text-card-foreground mb-2">Reported By</h5>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={14} color="white" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{issue?.reporter?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(issue?.reportedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          {issue?.assignedTo && (
            <div>
              <h5 className="font-medium text-card-foreground mb-2">Assigned To</h5>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="UserCheck" size={14} color="white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{issue?.assignedTo?.name}</p>
                  <p className="text-xs text-muted-foreground">{issue?.assignedTo?.department}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {issue?.timeline && issue?.timeline?.length > 0 && (
            <div>
              <h5 className="font-medium text-card-foreground mb-2">Timeline</h5>
              <div className="space-y-2">
                {issue?.timeline?.slice(0, 3)?.map((event, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-card-foreground">{event?.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event?.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {issue?.timeline?.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-4">
                    +{issue?.timeline?.length - 3} more updates
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Votes/Reactions */}
          {issue?.votes && (
            <div>
              <h5 className="font-medium text-card-foreground mb-2">Community Response</h5>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Icon name="ThumbsUp" size={14} className="text-success" />
                  <span className="text-sm text-muted-foreground">{issue?.votes?.upvotes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="MessageCircle" size={14} className="text-primary" />
                  <span className="text-sm text-muted-foreground">{issue?.votes?.comments || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border space-y-2">
        <Button
          variant="default"
          fullWidth
          iconName="Plus"
          iconPosition="left"
          iconSize={16}
          onClick={() => onReportSimilar(issue)}
        >
          Report Similar Issue
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            iconName="ExternalLink"
            iconPosition="left"
            iconSize={14}
          >
            <Link to={`/issue/${issue?.id}`} className="w-full">
              View Full Details
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            iconName="Share2"
            iconPosition="left"
            iconSize={14}
            onClick={() => {
              navigator.share?.({
                title: issue?.title,
                text: issue?.description,
                url: window.location?.href
              });
            }}
          >
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsPanel;