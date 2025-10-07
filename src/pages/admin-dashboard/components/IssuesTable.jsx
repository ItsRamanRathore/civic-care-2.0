import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const IssuesTable = ({
  issues,
  onStatusUpdate,
  onIssueSelection,
  onSelectAll,
  selectedIssues,
  departments
}) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(null);

  const handleSelectAll = (checked) => {
    onSelectAll(checked);
  };

  const handleSelectIssue = (issueId, checked) => {
    onIssueSelection(issueId, checked);
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      setShowStatusDropdown(null);
      await onStatusUpdate(issueId, newStatus, `Status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      // Error is already handled in the parent component
    }
  };

  const handleDepartmentAssign = async (issueId, departmentId) => {
    try {
      const { civicIssueService } = await import('../../../services/civicIssueService');
      const { success, error } = await civicIssueService.assignToDepartment(issueId, departmentId);

      if (!success) {
        alert(`Failed to assign department: ${error}`);
      } else {
        // Refresh the page or update local state
        window.location.reload();
      }
    } catch (error) {
      alert(`Error assigning department: ${error.message}`);
    }
    setShowDepartmentDropdown(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowStatusDropdown(null);
      setShowDepartmentDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedIssues = [...issues]?.sort((a, b) => {
    if (sortConfig?.direction === 'asc') {
      return a?.[sortConfig?.key] > b?.[sortConfig?.key] ? 1 : -1;
    }
    return a?.[sortConfig?.key] < b?.[sortConfig?.key] ? 1 : -1;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table Header Actions */}
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {selectedIssues?.length} of {issues?.length} selected
            </span>

          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csvContent = [
                ['ID', 'Title', 'Category', 'Status', 'Priority', 'Address', 'Created'],
                ...issues.map(issue => [
                  issue.id,
                  issue.title,
                  issue.category,
                  issue.status,
                  issue.priority,
                  issue.address,
                  formatDate(issue.created_at)
                ])
              ].map(row => row.join(',')).join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `civic-issues-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            iconName="Download"
            iconPosition="left"
            iconSize={14}
          >
            Export CSV
          </Button>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={selectedIssues?.length === issues?.length && issues?.length > 0}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center space-x-1 hover:text-foreground transition-smooth"
                >
                  <span>Issue ID</span>
                  <Icon name={getSortIcon('id')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-1 hover:text-foreground transition-smooth"
                >
                  <span>Title & Location</span>
                  <Icon name={getSortIcon('title')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center space-x-1 hover:text-foreground transition-smooth"
                >
                  <span>Category</span>
                  <Icon name={getSortIcon('category')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-foreground transition-smooth"
                >
                  <span>Status</span>
                  <Icon name={getSortIcon('status')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-1 hover:text-foreground transition-smooth"
                >
                  <span>Priority</span>
                  <Icon name={getSortIcon('priority')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('assignedDepartment')}
                  className="flex items-center space-x-1 hover:text-foreground transition-smooth"
                >
                  <span>Department</span>
                  <Icon name={getSortIcon('assignedDepartment')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center space-x-1 hover:text-foreground transition-smooth"
                >
                  <span>Submitted</span>
                  <Icon name={getSortIcon('created_at')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedIssues?.map((issue) => (
              <tr key={issue?.id} className="hover:bg-muted/30 transition-smooth">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIssues?.includes(issue?.id)}
                    onChange={(e) => handleSelectIssue(issue?.id, e?.target?.checked)}
                    className="rounded border-border"
                  />
                </td>
                <td className="p-4">
                  <span className="font-mono text-sm text-primary">
                    #{issue?.id?.slice(0, 8)}...
                  </span>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-card-foreground line-clamp-1">{issue?.title}</p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Icon name="MapPin" size={12} />
                      <span className="line-clamp-1">{issue?.address}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary capitalize">
                    {issue?.category?.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusDropdown(showStatusDropdown === issue?.id ? null : issue?.id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue?.status)} hover:opacity-80 transition-opacity`}
                    >
                      {issue?.status?.replace('_', ' ')?.toUpperCase()}
                      <Icon name="ChevronDown" size={12} className="ml-1" />
                    </button>

                    {showStatusDropdown === issue?.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                        {['submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(issue?.id, status)}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            {status.replace('_', ' ').toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue?.priority)}`}>
                    {issue?.priority?.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowDepartmentDropdown(showDepartmentDropdown === issue?.id ? null : issue?.id)}
                      className="text-sm text-card-foreground hover:text-primary transition-colors flex items-center"
                    >
                      {issue?.departments?.name || 'Unassigned'}
                      <Icon name="ChevronDown" size={12} className="ml-1" />
                    </button>

                    {showDepartmentDropdown === issue?.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-md shadow-lg z-10 min-w-[150px]">
                        <button
                          onClick={() => handleDepartmentAssign(issue?.id, null)}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          Unassigned
                        </button>
                        {departments?.map(dept => (
                          <button
                            key={dept.id}
                            onClick={() => handleDepartmentAssign(issue?.id, dept.id)}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            {dept.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">{formatDate(issue?.created_at)}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/issue/${issue?.id}`)}
                      className="h-8 w-8"
                      title="View Details"
                    >
                      <Icon name="Eye" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        try {
                          const newStatus = issue?.status === 'resolved' ? 'in_progress' : 'resolved';
                          console.log(`Attempting to change status from ${issue?.status} to ${newStatus} for issue ${issue?.id}`);
                          
                          // Prevent navigation during the update
                          const button = document.activeElement;
                          if (button) button.blur();
                          
                          await handleStatusChange(issue?.id, newStatus);
                        } catch (error) {
                          console.error('Button click error:', error);
                        }
                      }}
                      className="h-8 w-8"
                      title={issue?.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                    >
                      <Icon name={issue?.status === 'resolved' ? 'RotateCcw' : 'Check'} size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Table Footer */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {sortedIssues?.length} of {issues?.length} issues</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <Icon name="ChevronLeft" size={14} />
            </Button>
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs">1</span>
            <Button variant="outline" size="sm" disabled>
              <Icon name="ChevronRight" size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuesTable;