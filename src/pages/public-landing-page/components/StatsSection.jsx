import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { civicIssueService } from '../../../services/civicIssueService';

const StatsSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data, error } = await civicIssueService?.getIssuesStats();
        
        if (!error && data) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Default stats for loading state
  const defaultStats = [
    { icon: 'MessageSquare', value: '0', label: 'Issues Reported', color: 'text-blue-600' },
    { icon: 'CheckCircle', value: '0', label: 'Issues Resolved', color: 'text-green-600' },
    { icon: 'Clock', value: '0', label: 'In Progress', color: 'text-yellow-600' },
    { icon: 'Users', value: '0', label: 'Active Citizens', color: 'text-purple-600' }
  ];

  // Calculate display stats from real data
  const displayStats = stats ? [
    { 
      icon: 'MessageSquare', 
      value: stats?.total?.toLocaleString() || '0', 
      label: 'Issues Reported', 
      color: 'text-blue-600' 
    },
    { 
      icon: 'CheckCircle', 
      value: (stats?.byStatus?.resolved || 0)?.toLocaleString(), 
      label: 'Issues Resolved', 
      color: 'text-green-600' 
    },
    { 
      icon: 'Clock', 
      value: (stats?.byStatus?.in_progress || 0)?.toLocaleString(), 
      label: 'In Progress', 
      color: 'text-yellow-600' 
    },
    { 
      icon: 'TrendingUp', 
      value: (stats?.recentCount || 0)?.toLocaleString(), 
      label: 'This Week', 
      color: 'text-purple-600' 
    }
  ] : defaultStats;

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">Community Impact</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how our community is working together to address civic issues and improve our neighborhood.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayStats?.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <Icon name={stat?.icon} size={24} className={stat?.color} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${stat?.color} ${loading ? 'animate-pulse' : ''}`}>
                    {loading ? '...' : stat?.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat?.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        {stats && !loading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">By Category</h3>
              <div className="space-y-2">
                {Object.entries(stats?.byCategory || {})?.slice(0, 3)?.map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{category?.replace('_', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">By Priority</h3>
              <div className="space-y-2">
                {Object.entries(stats?.byPriority || {})?.map(([priority, count]) => (
                  <div key={priority} className="flex justify-between items-center text-sm">
                    <span className="capitalize flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        priority === 'high' ? 'bg-red-500' : 
                        priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></span>
                      {priority}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>This Month</span>
                  <span className="font-medium">{stats?.recentCount || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Resolved Rate</span>
                  <span className="font-medium">
                    {stats?.total > 0 
                      ? Math.round(((stats?.byStatus?.resolved || 0) / stats?.total) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Avg Response</span>
                  <span className="font-medium">2-3 days</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsSection;