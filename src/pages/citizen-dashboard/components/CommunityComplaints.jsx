import React, { useState, useEffect } from 'react';
import { getAllCivicIssues } from '../../../services/civicIssueService';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../contexts/LanguageContext';

const CommunityComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const allComplaints = await getAllCivicIssues();
      setComplaints(allComplaints);
    } catch (error) {
      console.error('Error fetching community complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    { value: 'all', label: t('allCategories') },
    { value: 'roads', label: t('roads') },
    { value: 'water', label: t('water') },
    { value: 'electricity', label: t('electricity') },
    { value: 'sanitation', label: t('sanitation') },
    { value: 'other', label: t('other') }
  ];

  const statusOptions = [
    { value: 'all', label: t('allStatus') },
    { value: 'open', label: t('open') },
    { value: 'in-progress', label: t('inProgress') },
    { value: 'resolved', label: t('resolved') },
    { value: 'closed', label: t('closed') }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'submitted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'roads': return 'Car';
      case 'water': return 'Droplets';
      case 'electricity': return 'Zap';
      case 'sanitation': return 'Trash2';
      case 'other': return 'AlertCircle';
      default: return 'FileText';
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('loadingCommunityComplaints')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-card-foreground">{t('communityComplaints')}</h2>
        <p className="text-muted-foreground text-sm">{t('exploreCommunityIssues')}</p>
      </div>

      {/* Filters Section */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-card-foreground mb-2">{t('searchCommunityIssues')}</label>
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchByTitleDescLocation')}
              className="w-full"
            />
          </div>
          <div className="w-full lg:w-56">
            <label className="block text-sm font-medium text-card-foreground mb-2">{t('category')}</label>
            <Select
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              options={categories}
              className="w-full"
            />
          </div>
          <div className="w-full lg:w-56">
            <label className="block text-sm font-medium text-card-foreground mb-2">{t('status')}</label>
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
      {filteredComplaints.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-muted rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Icon name="Search" size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">
              {t('noCommunityComplaintsFound')}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? t('noCommunityMessageFiltered')
                : t('noCommunityMessageEmpty')
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-card border border-border rounded-lg shadow-card hover:shadow-modal transition-smooth overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={getCategoryIcon(complaint.category)} size={20} className="text-primary" />
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {complaint.category?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                    {complaint.status?.replace('_', ' ')?.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-card-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={`/issue/${complaint.id}`} className="hover:underline">
                    {complaint.title}
                  </Link>
                </h3>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                  {complaint.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-muted/30 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Icon name="MapPin" size={14} className="text-muted-foreground" />
                    <span className="line-clamp-1">{complaint.location || complaint.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Icon name="Calendar" size={14} className="text-muted-foreground" />
                    <span>{formatDate(complaint.created_at)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <Link
                    to={`/issue/${complaint.id}`}
                    className="inline-flex items-center text-primary hover:text-primary hover:underline transition-colors"
                  >
                    <span>{t('viewDetails')}</span>
                    <Icon name="ArrowRight" size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {filteredComplaints.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Info" size={16} className="text-muted-foreground" />
              <span>{t('showingXCommunityComplaints').replace('{count}', filteredComplaints.length)}</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span>{t('resolved')}: {filteredComplaints.filter(c => c.status === 'resolved').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span>{t('inProgress')}: {filteredComplaints.filter(c => c.status === 'in_progress').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>{t('open')}: {filteredComplaints.filter(c => c.status === 'submitted' || c.status === 'in_review').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityComplaints;
