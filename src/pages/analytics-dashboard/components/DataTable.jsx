import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DataTable = ({ data, loading = false, onExport, realTime = false }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Process real data or use fallback
  const processedData = data && data.length > 0 ? data.map(item => ({
    id: item.id || `ISS-${Date.now()}`,
    category: item.category || 'Unknown',
    title: item.title || 'No title',
    location: item.address || item.location || 'Unknown',
    status: item.status || 'pending',
    priority: item.priority || 'medium',
    reportedDate: item.date || item.created_at || new Date().toISOString().split('T')[0],
    resolvedDate: item.resolved_at || null,
    department: item.department || 'Unassigned',
    resolutionTime: item.resolutionTime || null
  })) : [
    {
      id: 'No data available',
      category: '-',
      title: 'No issues found',
      location: '-',
      status: 'pending',
      priority: 'low',
      reportedDate: new Date().toISOString().split('T')[0],
      resolvedDate: null,
      department: '-',
      resolutionTime: null
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-success bg-success/10';
      case 'in-progress': return 'text-warning bg-warning/10';
      case 'assigned': return 'text-primary bg-primary/10';
      case 'pending': return 'text-accent bg-accent/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-accent';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = processedData;

    if (filterCategory !== 'all') {
      filtered = filtered?.filter(item => item?.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered?.filter(item => item?.status === filterStatus);
    }

    return filtered?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      if (sortField === 'reportedDate' || sortField === 'resolvedDate') {
        aValue = new Date(aValue || '1970-01-01');
        bValue = new Date(bValue || '1970-01-01');
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [processedData, filterCategory, filterStatus, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData?.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const categories = ['all', ...new Set(processedData.map(item => item.category))];
  const statuses = ['all', 'pending', 'submitted', 'assigned', 'in_progress', 'resolved'];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)]?.map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      {/* Header with filters */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-card-foreground">Recent Issues</h3>
            {realTime && (
              <div className="flex items-center text-xs text-green-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Real-time
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {categories?.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {statuses?.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status?.replace('_', ' ')?.charAt(0)?.toUpperCase() + status?.replace('_', ' ')?.slice(1)}
                </option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              iconName="Download"
              iconPosition="left"
              iconSize={14}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {[
                { key: 'id', label: 'Issue ID' },
                { key: 'category', label: 'Category' },
                { key: 'title', label: 'Title' },
                { key: 'location', label: 'Location' },
                { key: 'status', label: 'Status' },
                { key: 'priority', label: 'Priority' },
                { key: 'reportedDate', label: 'Reported' },
                { key: 'resolutionTime', label: 'Resolution Time' }
              ]?.map(column => (
                <th
                  key={column?.key}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted transition-smooth"
                  onClick={() => handleSort(column?.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column?.label}</span>
                    {sortField === column?.key && (
                      <Icon 
                        name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                        size={14} 
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData?.map((item) => (
              <tr key={item?.id} className="hover:bg-muted/30 transition-smooth">
                <td className="px-4 py-3 text-sm font-medium text-card-foreground">
                  {item?.id}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {item?.category}
                </td>
                <td className="px-4 py-3 text-sm text-card-foreground max-w-xs truncate">
                  {item?.title}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {item?.location}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item?.status)}`}>
                    {item?.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${getPriorityColor(item?.priority)}`}>
                    {item?.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {item.reportedDate ? new Date(item.reportedDate)?.toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {item?.resolutionTime ? `${item?.resolutionTime} days` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData?.length)} of {filteredAndSortedData?.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              iconName="ChevronLeft"
              iconSize={14}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, totalPages))]?.map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              iconName="ChevronRight"
              iconSize={14}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;