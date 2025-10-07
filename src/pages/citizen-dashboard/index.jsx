import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import MetricsCard from '../admin-dashboard/components/MetricsCard';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { civicIssueService } from '../../services/civicIssueService';

const CitizenDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(location.pathname.includes('community') ? 'community' : 'personal');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    recent: 0
  });

  const tabs = [
    {
      id: 'personal',
      label: t('myComplaints'),
      path: '/citizen-dashboard/my-complaints'
    },
    {
      id: 'community',
      label: t('communityComplaints'),
      path: '/citizen-dashboard/community'
    }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const myIssues = await civicIssueService.getCivicIssuesByUser(user.id);
        
        const stats = {
          total: myIssues.length,
          pending: myIssues.filter(issue => issue.status === 'submitted' || issue.status === 'in_review').length,
          inProgress: myIssues.filter(issue => issue.status === 'in_progress').length,
          resolved: myIssues.filter(issue => issue.status === 'resolved').length,
          recent: myIssues.filter(issue => {
            const issueDate = new Date(issue.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return issueDate > weekAgo;
          }).length
        };

        setStats(stats);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user]);

  const dashboardMetrics = [
    {
      title: t('totalComplaints'),
      value: stats.total,
      change: `+${stats.recent} ${t('thisWeek')}`,
      changeType: 'info',
      icon: 'FileText'
    },
    {
      title: t('pending'),
      value: stats.pending,
      change: t('awaitingResponse'),
      changeType: 'warning',
      icon: 'Clock'
    },
    {
      title: t('inProgress'),
      value: stats.inProgress,
      change: t('beingAddressed'),
      changeType: 'info',
      icon: 'Settings'
    },
    {
      title: t('resolved'),
      value: stats.resolved,
      change: `${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% ${t('resolutionRate')}`,
      changeType: 'positive',
      icon: 'CheckCircle'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{t('citizenDashboard')}</h1>
              <p className="text-muted-foreground mt-1">
                {t('welcomeBack')} {user?.full_name || 'Citizen'}! {t('trackIssues')}
              </p>
            </div>
            <Link
              to="/issue-reporting-form"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              <span>{t('reportIssue')}</span>
            </Link>
          </div>
        </div>
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardMetrics.map((metric, index) => (
            <MetricsCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeType={metric.changeType}
              icon={metric.icon}
              description=""
            />
          ))}
        </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-lg">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-card-foreground">
                    {activeTab === 'personal' ? t('myComplaints') : t('communityComplaints')}
                  </h2>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="bg-muted/30 border-b border-border">
                <nav className="flex">
                  {tabs.map(tab => (
                    <Link
                      key={tab.id}
                      to={tab.path}
                      className={cn(
                        'relative py-3 px-6 text-sm font-medium transition-colors flex items-center space-x-2 border-b-2',
                        activeTab === tab.id
                          ? 'text-primary border-primary bg-background'
                          : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
                      )}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon
                        name={tab.id === 'personal' ? 'User' : 'Users'}
                        size={16}
                      />
                      <span>{tab.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                <Outlet />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">{t('quickActions')}</h3>
              <div className="space-y-3">
                <Link
                  to="/issue-reporting-form"
                  className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
                >
                  <Icon name="Plus" size={16} className="text-primary mr-3" />
                  <span className="text-sm font-medium text-card-foreground">{t('reportIssue')}</span>
                </Link>

                <Link
                  to="/interactive-issue-map"
                  className="flex items-center p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors group"
                >
                  <Icon name="Map" size={16} className="text-muted-foreground mr-3" />
                  <span className="text-sm font-medium text-card-foreground">{t('issueMap')}</span>
                </Link>

                <Link
                  to="/public-reports-listing"
                  className="flex items-center p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors group"
                >
                  <Icon name="List" size={16} className="text-muted-foreground mr-3" />
                  <span className="text-sm font-medium text-card-foreground">{t('browseIssues')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
