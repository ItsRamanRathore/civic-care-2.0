import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import { useAuth } from '../../contexts/AuthContext';
import { civicIssueService } from '../../services/civicIssueService';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CitizenComplaintsList from './components/CitizenComplaintsList';
import CitizenComplaintsMap from './components/CitizenComplaintsMap';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserComplaints();
  }, [user, navigate]);

  const fetchUserComplaints = async () => {
    try {
      setLoading(true);
      const userComplaints = await civicIssueService.getCivicIssuesByUser(user.id);
      setComplaints(userComplaints);

      // Calculate stats
      const stats = {
        total: userComplaints.length,
        pending: userComplaints.filter(c => c.status === 'submitted' || c.status === 'in_review').length,
        inProgress: userComplaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length,
        resolved: userComplaints.filter(c => c.status === 'resolved').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching user complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'list',
      label: 'My Complaints',
      icon: 'FileText'
    },
    {
      id: 'map',
      label: 'Complaints Map',
      icon: 'Map'
    }
  ];

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-secondary text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Citizen Dashboard</h1>
              <p className="text-primary-foreground/80 mt-1">
                Welcome back, {user?.full_name || 'Citizen'}! Track your civic contributions.
              </p>
            </div>
            <Button
              onClick={() => navigate('/issue-reporting-form')}
              className="bg-white text-primary hover:bg-primary-foreground/90"
              iconName="Plus"
              iconPosition="left"
            >
              Report New Issue
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-primary-foreground/80">Total Complaints</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-primary-foreground/80">Pending</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <div className="text-sm text-primary-foreground/80">In Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <div className="text-sm text-primary-foreground/80">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                }`}
              >
                <Icon name={tab.icon} size={16} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading your complaints...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'list' && (
              <CitizenComplaintsList
                complaints={complaints}
                onComplaintUpdate={fetchUserComplaints}
              />
            )}
            {activeTab === 'map' && (
              <CitizenComplaintsMap
                complaints={complaints}
                userLocation={user?.location}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;