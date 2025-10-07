import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getCivicIssuesByUser } from '../../../services/civicIssueService';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../contexts/LanguageContext';

const MyComplaints = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const userComplaints = await getCivicIssuesByUser(user.id);
      setComplaints(userComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredComplaints = React.useMemo(() => {
    return complaints.filter(complaint => {
      const matchesSearch = searchTerm === '' ||
        (complaint.title && complaint.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (complaint.description && complaint.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (complaint.address && complaint.address.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  const statusOrder = {
    'submitted': 1,
    'in_review': 2,
    'assigned': 3,
    'in_progress': 4,
    'resolved': 5,
    'closed': 6,
    'rejected': 7
  };

  const sortedComplaints = React.useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle status sorting
      if (sortConfig.key === 'status') {
        aValue = statusOrder[aValue] || 0;
        bValue = statusOrder[bValue] || 0;
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  }, [filteredComplaints, sortConfig]);

  const statusOptions = [
    { value: 'all', label: t('allStatus') },
    { value: 'submitted', label: t('submitted') },
    { value: 'in_review', label: t('inReview') },
    { value: 'assigned', label: t('assigned') },
    { value: 'in_progress', label: t('inProgress') },
    { value: 'resolved', label: t('resolved') },
    { value: 'closed', label: t('closed') },
    { value: 'rejected', label: t('rejected') }
  ];

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-pulse"></div>
        </div>
        <p className="text-gray-600 font-medium">{t('loadingComplaints')}</p>
        <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">{t('myComplaints')}</h2>
          <p className="text-muted-foreground text-sm">{t('trackSubmittedIssues')}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-card-foreground mb-2">{t('searchComplaints')}</label>
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchByTitleDescLocation')}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-card-foreground mb-2">{t('filterByStatus')}</label>
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={statusOptions}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {sortedComplaints.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-muted rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Icon name="Search" size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">
              {t('noComplaintsFound')}
            </h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {searchTerm || statusFilter !== 'all'
                ? t('noComplaintsMessageFiltered')
                : t('noComplaintsMessageEmpty')
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort('id')}
                      className="flex items-center space-x-2 hover:text-primary transition-colors group"
                    >
                      <span>{t('issueId')}</span>
                      <Icon name={getSortIcon('id')} size={16} className="group-hover:text-primary" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center space-x-2 hover:text-primary transition-colors group"
                    >
                      <span>{t('titleAndLocation')}</span>
                      <Icon name={getSortIcon('title')} size={16} className="group-hover:text-primary" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center space-x-2 hover:text-primary transition-colors group"
                    >
                      <span>{t('category')}</span>
                      <Icon name={getSortIcon('category')} size={16} className="group-hover:text-primary" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-2 hover:text-primary transition-colors group"
                    >
                      <span>{t('status')}</span>
                      <Icon name={getSortIcon('status')} size={16} className="group-hover:text-primary" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center space-x-2 hover:text-primary transition-colors group"
                    >
                      <span>{t('submitted')}</span>
                      <Icon name={getSortIcon('created_at')} size={16} className="group-hover:text-primary" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedComplaints?.map((complaint, index) => (
                  <tr key={complaint.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="font-mono text-sm text-primary font-medium">
                          #{complaint.id?.slice(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <p className="font-medium text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {complaint.title}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Icon name="MapPin" size={14} className="text-muted-foreground" />
                          <span className="line-clamp-1">{complaint.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {complaint.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status?.replace('_', ' ')?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Icon name="Calendar" size={14} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">{formatDate(complaint.created_at)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/issue/${complaint.id}`)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        title="View Details"
                      >
                        <Icon name="Eye" size={16} className="mr-2" />
                        {t('view')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-muted/30 px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Info" size={16} className="text-muted-foreground" />
                <span>{t('showingXOfYComplaints').replace('{countShown}', sortedComplaints?.length).replace('{total}', complaints?.length)}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span>{t('resolved')}: {complaints.filter(c => c.status === 'resolved').length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span>{t('pending')}: {complaints.filter(c => c.status === 'submitted' || c.status === 'in_review').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
