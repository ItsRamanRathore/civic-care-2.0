import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import FilterToolbar from './components/FilterToolbar';
import IssueGrid from './components/IssueGrid';
import MapView from './components/MapView';
import Pagination from './components/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { useCivicIssues } from '../../hooks/useCivicIssues';
import Icon from '../../components/AppIcon';

const PublicReportsListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Filters state
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priority: '',
    search: '',
    sortBy: 'newest'
  });

  // Use civic issues hook with filters
  const { issues, loading, error, stats, voteOnIssue } = useCivicIssues(filters);

  // Add mock data for testing if no real data
  const mockIssues = [
    {
      id: 'mock-1',
      title: 'Large pothole on Main Street',
      description: 'There\'s a significant pothole causing traffic issues',
      category: 'roads',
      status: 'pending',
      priority: 'high',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      address: 'Main Street, Connaught Place, New Delhi',
      created_at: new Date().toISOString(),
      upvoteCount: 5,
      imageCount: 1
    },
    {
      id: 'mock-2',
      title: 'Overflowing garbage bin',
      description: 'Community garbage bin has been overflowing for days',
      category: 'sanitation',
      status: 'in-progress',
      priority: 'medium',
      coordinates: { lat: 28.6200, lng: 77.2100 },
      address: 'Sector 15, Rohini, New Delhi',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      upvoteCount: 3,
      imageCount: 0
    },
    {
      id: 'mock-3',
      title: 'Street light not working',
      description: 'Street light has been non-functional for over a week',
      category: 'utilities',
      status: 'resolved',
      priority: 'medium',
      coordinates: { lat: 28.6080, lng: 77.2150 },
      address: 'Park Avenue, Lajpat Nagar, New Delhi',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      upvoteCount: 2,
      imageCount: 1
    }
  ];

  // Use mock data if no real data is available
  const displayIssues = issues && issues.length > 0 ? issues : mockIssues;
  
  // Debug log
  console.log('📊 Display issues:', displayIssues);
  console.log('📍 Issues with coordinates:', displayIssues?.filter(issue => issue?.coordinates));

  // Calculate pagination
  const totalItems = displayIssues?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIssues = displayIssues?.slice(startIndex, startIndex + itemsPerPage) || [];

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (sortBy) => {
    setFilters(prev => ({ ...prev, sortBy }));
    setCurrentPage(1);
  };

  // Handle vote
  const handleVote = async (issueId, voteType) => {
    const { success, error } = await voteOnIssue(issueId, voteType);
    
    if (!success && error) {
      alert(error);
    }
  };

  // Handle issue click
  const handleIssueClick = (issue) => {
    navigate(`/issue/${issue?.id}`);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Apply client-side filtering and sorting for better UX
  const processedIssues = React.useMemo(() => {
    let filtered = [...(displayIssues || [])];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      filtered = filtered?.filter(issue => 
        issue?.title?.toLowerCase()?.includes(searchLower) ||
        issue?.description?.toLowerCase()?.includes(searchLower) ||
        issue?.address?.toLowerCase()?.includes(searchLower)
      );
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'newest':
        filtered?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        filtered?.sort((a, b) => priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority]);
        break;
      case 'most_voted':
        filtered?.sort((a, b) => (b?.upvoteCount || 0) - (a?.upvoteCount || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [displayIssues, filters?.search, filters?.sortBy]);

  // Get paginated results from processed issues
  const finalPaginatedIssues = processedIssues?.slice(startIndex, startIndex + itemsPerPage) || [];
  const finalTotalPages = Math.ceil(processedIssues?.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Public Reports</h1>
              <p className="text-muted-foreground mt-1">
                Browse and track community issues reported by residents
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' ?'bg-background text-text-primary shadow-sm' :'text-muted-foreground hover:text-text-primary'
                  }`}
                >
                  <Icon name="Grid" size={16} className="inline mr-2" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map' ?'bg-background text-text-primary shadow-sm' :'text-muted-foreground hover:text-text-primary'
                  }`}
                >
                  <Icon name="MapPin" size={16} className="inline mr-2" />
                  Map
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-text-primary">{stats?.total}</div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{stats?.byStatus?.resolved || 0}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats?.byStatus?.in_progress || 0}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{stats?.recentCount}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <FilterToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onSearchChange={handleSearch}
          onSortChange={handleSortChange}
          onViewToggle={setViewMode}
          totalResults={processedIssues?.length || 0}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Loading reports...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3">
              <Icon name="AlertCircle" size={20} className="text-red-500" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Loading Reports</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {processedIssues?.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No Reports Found</h3>
                <p className="text-muted-foreground mb-6">
                  {filters?.search || filters?.category || filters?.status || filters?.priority
                    ? 'Try adjusting your filters to see more results.' :'No reports have been submitted yet.'}
                </p>
                <button
                  onClick={() => navigate('/issue-reporting-form')}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Report an Issue
                </button>
              </div>
            ) : (
              <>
                {/* Content View */}
                {viewMode === 'grid' ? (
                  <IssueGrid
                    issues={finalPaginatedIssues}
                    onIssueClick={handleIssueClick}
                    onVote={handleVote}
                    onViewDetails={handleIssueClick}
                    loading={loading}
                    currentUser={user}
                  />
                ) : (
                  <MapView
                    issues={processedIssues} // Show all issues on map, not paginated
                    onIssueClick={handleIssueClick}
                    onIssueSelect={handleIssueClick}
                    selectedIssue={null}
                    selectedFilters={filters}
                  />
                )}

                {/* Pagination */}
                {viewMode === 'grid' && finalTotalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={finalTotalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={processedIssues?.length}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicReportsListing;