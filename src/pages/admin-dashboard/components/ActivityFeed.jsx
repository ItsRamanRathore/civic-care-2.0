import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'new-issue': return { name: 'Plus', color: 'text-primary' };
      case 'status-change': return { name: 'RefreshCw', color: 'text-warning' };
      case 'assignment': return { name: 'Users', color: 'text-secondary' };
      case 'resolution': return { name: 'CheckCircle', color: 'text-success' };
      case 'comment': return { name: 'MessageCircle', color: 'text-muted-foreground' };
      default: return { name: 'Activity', color: 'text-muted-foreground' };
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={20} className="text-primary" />
          <h3 className="font-medium text-card-foreground">Recent Activity</h3>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {activities?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Activity" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activities?.map((activity) => {
              const iconInfo = getActivityIcon(activity?.type);
              
              return (
                <div key={activity?.id} className="p-4 hover:bg-muted/30 transition-smooth">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 ${iconInfo?.color}`}>
                      <Icon name={iconInfo?.name} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-card-foreground line-clamp-1">
                          {activity?.title}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {getTimeAgo(activity?.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {activity?.description}
                      </p>
                      {activity?.issueId && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-primary font-mono">
                            #{activity?.issueId}
                          </span>
                          {activity?.location && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <div className="flex items-center space-x-1">
                                <Icon name="MapPin" size={10} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {activity?.location}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-3 border-t border-border bg-muted/50">
        <button className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-smooth">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;