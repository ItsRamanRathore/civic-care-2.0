import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const MapControls = ({ 
  onCategoryFilter, 
  onStatusFilter, 
  onTimeRangeFilter,
  onLayerToggle,
  onDrawingModeToggle,
  selectedCategories = [],
  selectedStatuses = [],
  selectedTimeRange = 'all',
  activeLayers = [],
  isDrawingMode = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { value: 'roads', label: 'Roads & Infrastructure', color: '#E63946' },
    { value: 'sanitation', label: 'Sanitation & Waste', color: '#F77F00' },
    { value: 'utilities', label: 'Utilities & Power', color: '#FCBF49' },
    { value: 'safety', label: 'Safety & Security', color: '#277DA1' },
    { value: 'environment', label: 'Environment', color: '#43AA8B' },
    { value: 'transport', label: 'Public Transport', color: '#90E0EF' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', color: '#E63946' },
    { value: 'in-progress', label: 'In Progress', color: '#F77F00' },
    { value: 'resolved', label: 'Resolved', color: '#43AA8B' },
    { value: 'closed', label: 'Closed', color: '#6C757D' }
  ];

  const timeRanges = [
    { value: 'all', label: 'All Time' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' }
  ];

  const layers = [
    { value: 'boundaries', label: 'Administrative Boundaries' },
    { value: 'departments', label: 'Department Zones' },
    { value: 'density', label: 'Issue Density Heatmap' }
  ];

  const handleCategoryChange = (categoryValue, checked) => {
    const updated = checked 
      ? [...selectedCategories, categoryValue]
      : selectedCategories?.filter(c => c !== categoryValue);
    onCategoryFilter(updated);
  };

  const handleStatusChange = (statusValue, checked) => {
    const updated = checked 
      ? [...selectedStatuses, statusValue]
      : selectedStatuses?.filter(s => s !== statusValue);
    onStatusFilter(updated);
  };

  const handleLayerChange = (layerValue, checked) => {
    const updated = checked 
      ? [...activeLayers, layerValue]
      : activeLayers?.filter(l => l !== layerValue);
    onLayerToggle(updated);
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-card border border-border rounded-lg shadow-modal">
      {/* Control Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-medium text-card-foreground">Map Controls</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6"
        >
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
        </Button>
      </div>
      {/* Expanded Controls */}
      {isExpanded && (
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Time Range Filter */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Time Range
            </label>
            <Select
              options={timeRanges}
              value={selectedTimeRange}
              onChange={(value) => onTimeRangeFilter(value)}
              placeholder="Select time range"
            />
          </div>

          {/* Category Filters */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Issue Categories
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {categories?.map((category) => (
                <div key={category?.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCategories?.includes(category?.value)}
                    onChange={(e) => handleCategoryChange(category?.value, e?.target?.checked)}
                  />
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category?.color }}
                    />
                    <span className="text-sm text-card-foreground">{category?.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Issue Status
            </label>
            <div className="space-y-2">
              {statuses?.map((status) => (
                <div key={status?.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedStatuses?.includes(status?.value)}
                    onChange={(e) => handleStatusChange(status?.value, e?.target?.checked)}
                  />
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status?.color }}
                    />
                    <span className="text-sm text-card-foreground">{status?.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layer Toggles */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Map Layers
            </label>
            <div className="space-y-2">
              {layers?.map((layer) => (
                <div key={layer?.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={activeLayers?.includes(layer?.value)}
                    onChange={(e) => handleLayerChange(layer?.value, e?.target?.checked)}
                  />
                  <span className="text-sm text-card-foreground">{layer?.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Drawing Tools */}
          <div className="pt-2 border-t border-border">
            <Button
              variant={isDrawingMode ? "default" : "outline"}
              size="sm"
              onClick={onDrawingModeToggle}
              iconName="Edit3"
              iconPosition="left"
              iconSize={14}
              fullWidth
            >
              {isDrawingMode ? 'Exit Drawing' : 'Area Search'}
            </Button>
          </div>
        </div>
      )}
      {/* Collapsed Quick Actions */}
      {!isExpanded && (
        <div className="p-2 flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDrawingModeToggle}
            className={`h-8 w-8 ${isDrawingMode ? 'bg-primary text-primary-foreground' : ''}`}
            title="Area Search"
          >
            <Icon name="Edit3" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Reset Filters"
            onClick={() => {
              onCategoryFilter([]);
              onStatusFilter([]);
              onTimeRangeFilter('all');
              onLayerToggle([]);
            }}
          >
            <Icon name="RotateCcw" size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapControls;