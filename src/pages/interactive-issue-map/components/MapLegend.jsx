import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MapLegend = ({ className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { 
      name: 'Roads & Infrastructure', 
      color: '#E63946', 
      icon: 'Construction',
      count: 45 
    },
    { 
      name: 'Sanitation & Waste', 
      color: '#F77F00', 
      icon: 'Trash2',
      count: 32 
    },
    { 
      name: 'Utilities & Power', 
      color: '#FCBF49', 
      icon: 'Zap',
      count: 28 
    },
    { 
      name: 'Safety & Security', 
      color: '#277DA1', 
      icon: 'Shield',
      count: 19 
    },
    { 
      name: 'Environment', 
      color: '#43AA8B', 
      icon: 'Leaf',
      count: 15 
    },
    { 
      name: 'Public Transport', 
      color: '#90E0EF', 
      icon: 'Bus',
      count: 12 
    }
  ];

  const statuses = [
    { name: 'Pending', color: '#E63946', count: 89 },
    { name: 'In Progress', color: '#F77F00', count: 42 },
    { name: 'Resolved', color: '#43AA8B', count: 20 },
    { name: 'Closed', color: '#6C757D', count: 0 }
  ];

  const mapSymbols = [
    { 
      name: 'Issue Cluster', 
      symbol: '●', 
      color: '#0D1B2A',
      description: 'Multiple issues in area'
    },
    { 
      name: 'High Priority', 
      symbol: '⚠', 
      color: '#E63946',
      description: 'Urgent attention required'
    },
    { 
      name: 'Department Zone', 
      symbol: '▢', 
      color: '#277DA1',
      description: 'Administrative boundary'
    },
    { 
      name: 'Search Radius', 
      symbol: '○', 
      color: '#43AA8B',
      description: 'Active search area'
    }
  ];

  return (
    <div className={`absolute bottom-4 left-4 z-10 bg-card border border-border rounded-lg shadow-modal ${className}`}>
      {/* Legend Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-medium text-card-foreground">Map Legend</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6"
        >
          <Icon name={isExpanded ? "ChevronDown" : "ChevronUp"} size={16} />
        </Button>
      </div>
      {/* Expanded Legend Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 max-w-xs">
          {/* Issue Categories */}
          <div>
            <h4 className="text-sm font-medium text-card-foreground mb-2">Issue Categories</h4>
            <div className="space-y-1">
              {categories?.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category?.color }}
                    />
                    <Icon name={category?.icon} size={12} className="text-muted-foreground" />
                    <span className="text-xs text-card-foreground">{category?.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{category?.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Status */}
          <div>
            <h4 className="text-sm font-medium text-card-foreground mb-2">Issue Status</h4>
            <div className="space-y-1">
              {statuses?.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status?.color }}
                    />
                    <span className="text-xs text-card-foreground">{status?.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{status?.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Symbols */}
          <div>
            <h4 className="text-sm font-medium text-card-foreground mb-2">Map Symbols</h4>
            <div className="space-y-1">
              {mapSymbols?.map((symbol, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span 
                    className="text-sm font-bold w-4 text-center"
                    style={{ color: symbol?.color }}
                  >
                    {symbol?.symbol}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs text-card-foreground">{symbol?.name}</span>
                    <p className="text-xs text-muted-foreground">{symbol?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="pt-2 border-t border-border">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-muted/50 rounded p-2">
                <p className="text-lg font-bold text-card-foreground">151</p>
                <p className="text-xs text-muted-foreground">Total Issues</p>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <p className="text-lg font-bold text-success">13.2%</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Collapsed Quick Reference */}
      {!isExpanded && (
        <div className="p-2">
          <div className="flex items-center space-x-2">
            {categories?.slice(0, 4)?.map((category, index) => (
              <div 
                key={index}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category?.color }}
                title={category?.name}
              />
            ))}
            <span className="text-xs text-muted-foreground">+2 more</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;