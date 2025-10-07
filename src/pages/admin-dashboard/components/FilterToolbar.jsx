import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const FilterToolbar = ({ onFilterChange, resultCount, departments = [] }) => {
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    department: '',
    priority: '',
    dateRange: '',
    location: ''
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'in_review', label: 'In Review' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'roads', label: 'Roads & Transportation' },
    { value: 'sanitation', label: 'Sanitation & Waste' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'safety', label: 'Safety' },
    { value: 'environment', label: 'Environment' },
    { value: 'other', label: 'Other' }
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map(dept => ({
      value: dept.id,
      label: dept.name
    }))
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      status: '',
      category: '',
      department: '',
      priority: '',
      dateRange: '',
      location: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="font-medium text-card-foreground">Filter Issues</h3>
          {resultCount !== undefined && (
            <span className="text-sm text-muted-foreground">
              ({resultCount} results)
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            iconName="X"
            iconPosition="left"
            iconSize={14}
          >
            Clear All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="Select status"
        />

        <Select
          label="Category"
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => handleFilterChange('category', value)}
          placeholder="Select category"
        />

        <Select
          label="Department"
          options={departmentOptions}
          value={filters?.department}
          onChange={(value) => handleFilterChange('department', value)}
          placeholder="Select department"
        />

        <Select
          label="Priority"
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => handleFilterChange('priority', value)}
          placeholder="Select priority"
        />

        <Select
          label="Date Range"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          placeholder="Select date range"
        />

        <Input
          label="Location"
          type="text"
          placeholder="Search location..."
          value={filters?.location}
          onChange={(e) => handleFilterChange('location', e?.target?.value)}
        />
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(filters)?.map(([key, value]) => {
            if (!value) return null;
            
            const getFilterLabel = (key, value) => {
              switch (key) {
                case 'status':
                  return statusOptions?.find(opt => opt?.value === value)?.label || value;
                case 'category':
                  return categoryOptions?.find(opt => opt?.value === value)?.label || value;
                case 'department':
                  return departmentOptions?.find(opt => opt?.value === value)?.label || value;
                case 'priority':
                  return priorityOptions?.find(opt => opt?.value === value)?.label || value;
                case 'dateRange':
                  return dateRangeOptions?.find(opt => opt?.value === value)?.label || value;
                default:
                  return value;
              }
            };

            return (
              <span
                key={key}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
              >
                <span>{getFilterLabel(key, value)}</span>
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-smooth"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterToolbar;