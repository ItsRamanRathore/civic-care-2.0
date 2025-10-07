import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';

const CitizenComplaintsList = ({ complaints, onComplaintUpdate }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return 'Clock';
      case 'in_review': return 'Eye';
      case 'assigned': return 'User';
      case 'in_progress': return 'Settings';
      case 'resolved': return 'CheckCircle';
      case 'closed': return 'X';
      case 'rejected': return 'XCircle';
      default: return 'FileText';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'in_review', label: 'In Review' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'status', label: 'By Status' },
    { value: 'title', label: 'By Title' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">My Complaints</h2>
          <p className="text-muted-foreground mt-1">
            Track and manage all your submitted civic issues
          </p>
        </div>
        <Button
          onClick={() => navigate('/issue-reporting-form')}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          iconName="Plus"
          iconPosition="left"
        >
          Report New Issue
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Search Complaints
            </label>
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description, or location..."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Filter by Status
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Sort By
            </label>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {sortedComplaints.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No complaints match your filters' : 'No complaints yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by reporting your first civic issue to make a difference in your community.'
              }
            </p>
            <Button
              onClick={() => navigate('/issue-reporting-form')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Report Your First Issue
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/issue/${complaint.id}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {complaint.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Icon name="MapPin" size={14} />
                    <span className="truncate">{complaint.address || 'Location not specified'}</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                  <Icon name={getStatusIcon(complaint.status)} size={12} />
                  <span>{complaint.status?.replace('_', ' ')?.toUpperCase()}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {complaint.description || 'No description provided'}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <span>#{complaint.id?.slice(0, 8)}...</span>
                  <span>{complaint.category?.replace('_', ' ')?.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={12} />
                  <span>{formatDate(complaint.created_at)}</span>
                </div>
              </div>

              {/* GPS Coordinates (if available) */}
              {complaint.latitude && complaint.longitude && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Navigation" size={12} />
                    <span>GPS: {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {sortedComplaints.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Icon name="Info" size={16} />
              <span>Showing {sortedComplaints.length} of {complaints.length} complaints</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">
                  Resolved: {complaints.filter(c => c.status === 'resolved').length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">
                  In Progress: {complaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">
                  Pending: {complaints.filter(c => c.status === 'submitted' || c.status === 'in_review').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenComplaintsList;