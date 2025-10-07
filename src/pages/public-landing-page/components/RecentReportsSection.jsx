import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { civicIssueService } from '../../../services/civicIssueService';

const RecentReportsSection = () => {
  const navigate = useNavigate();
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentReports = async () => {
      try {
        const { data, error } = await civicIssueService?.getIssues({ limit: 6 });
        
        if (!error && data) {
          setRecentReports(data);
        }
      } catch (error) {
        console.error('Error loading recent reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentReports();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'roads': return 'Car';
      case 'sanitation': return 'Trash';
      case 'utilities': return 'Zap';
      case 'infrastructure': return 'Building';
      case 'safety': return 'Shield';
      case 'environment': return 'Leaf';
      default: return 'AlertCircle';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const handleReportClick = (report) => {
    navigate(`/issue/${report?.id}`);
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Recent Reports</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay informed about the latest community issues and their resolution progress.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)]?.map((_, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">Recent Reports</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay informed about the latest community issues and their resolution progress.
          </p>
        </div>
        
        {recentReports?.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to report a community issue and help improve our neighborhood.
            </p>
            <Button onClick={() => navigate('/issue-reporting-form')}>
              Report an Issue
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {recentReports?.map((report) => (
                <div
                  key={report?.id}
                  onClick={() => handleReportClick(report)}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getCategoryIcon(report?.category)} 
                        size={16} 
                        className="text-primary" 
                      />
                      <span className="text-sm font-medium text-muted-foreground capitalize">
                        {report?.category?.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report?.status)}`}>
                      {report?.status?.replace('_', ' ')?.toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">
                      {report?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {report?.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Icon name="MapPin" size={12} />
                      <span className="truncate max-w-[120px]">
                        {report?.address?.split(',')?.[0] || 'Unknown location'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {(report?.upvoteCount || 0) > 0 && (
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Icon name="ThumbsUp" size={12} />
                          <span>{report?.upvoteCount}</span>
                        </div>
                      )}
                      <span className="text-muted-foreground">
                        {formatTimeAgo(report?.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/public-reports-listing')}
                iconName="ArrowRight"
                iconPosition="right"
              >
                View All Reports
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default RecentReportsSection;