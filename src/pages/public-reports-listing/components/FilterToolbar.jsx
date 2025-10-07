import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const FilterToolbar = ({ 
  onFilterChange, 
  onSearchChange, 
  onSortChange, 
  onViewToggle,
  currentView = 'grid',
  totalCount = 0 
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    timePeriod: 'all',
    location: '',
    radius: '5'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'roads', label: 'Roads & Transportation' },
    { value: 'sanitation', label: 'Sanitation & Waste' },
    { value: 'water', label: 'Water Supply' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'parks', label: 'Parks & Recreation' },
    { value: 'safety', label: 'Public Safety' },
    { value: 'other', label: 'Other Issues' }
  ];

  const timePeriodOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' }
  ];

  const radiusOptions = [
    { value: '1', label: '1 km' },
    { value: '5', label: '5 km' },
    { value: '10', label: '10 km' },
    { value: '25', label: '25 km' },
    { value: '50', label: '50 km' }
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'status', label: 'By Status' },
    { value: 'category', label: 'By Category' },
    { value: 'location', label: 'By Location' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onSortChange?.(value);
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      status: 'all',
      category: 'all',
      timePeriod: 'all',
      location: '',
      radius: '5'
    };
    setFilters(defaultFilters);
    setSearchQuery('');
    setSortBy('date_desc');
    onFilterChange?.(defaultFilters);
    onSearchChange?.('');
    onSortChange?.('date_desc');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.status !== 'all') count++;
    if (filters?.category !== 'all') count++;
    if (filters?.timePeriod !== 'all') count++;
    if (filters?.location?.trim()) count++;
    if (searchQuery?.trim()) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-card">
      {/* Top Row - Search and View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon 
              name="Search" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e?.target?.value)}
              placeholder="Search issues by title, description, or location..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              >
                <Icon name="X" size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Results Count and View Toggle */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'issue' : 'issues'} found
          </span>
          
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button
              variant={currentView === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewToggle?.('grid')}
              iconName="Grid3X3"
              iconSize={16}
              className="h-8 px-3"
            >
              Grid
            </Button>
            <Button
              variant={currentView === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewToggle?.('map')}
              iconName="Map"
              iconSize={16}
              className="h-8 px-3"
            >
              Map
            </Button>
          </div>
        </div>
      </div>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          iconName={isFilterExpanded ? "ChevronUp" : "ChevronDown"}
          iconPosition="right"
          iconSize={16}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
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
          
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={handleSortChange}
            placeholder="Sort by..."
            className="w-40"
          />
        </div>
      </div>
      {/* Expanded Filters */}
      {isFilterExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
          <Select
            label="Status"
            options={statusOptions}
            value={filters?.status}
            onChange={(value) => handleFilterChange('status', value)}
          />

          <Select
            label="Category"
            options={categoryOptions}
            value={filters?.category}
            onChange={(value) => handleFilterChange('category', value)}
          />

          <Select
            label="Time Period"
            options={timePeriodOptions}
            value={filters?.timePeriod}
            onChange={(value) => handleFilterChange('timePeriod', value)}
          />

          <div className="space-y-2">
            <Input
              label="Location"
              type="text"
              placeholder="Enter location..."
              value={filters?.location}
              onChange={(e) => handleFilterChange('location', e?.target?.value)}
            />
            {filters?.location && (
              <Select
                label="Search Radius"
                options={radiusOptions}
                value={filters?.radius}
                onChange={(value) => handleFilterChange('radius', value)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterToolbar;