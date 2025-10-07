import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChartContainer = ({ 
  title, 
  children, 
  onExport, 
  onRefresh, 
  loading = false,
  lastUpdated,
  controls,
  className = ""
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className} ${
      isFullscreen ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          {loading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Updating...</span>
            </div>
          )}
          {lastUpdated && !loading && (
            <span className="text-xs text-muted-foreground">
              Updated: {lastUpdated}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {controls}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh data"
          >
            <Icon name="RefreshCw" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onExport}
            title="Export chart"
          >
            <Icon name="Download" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Icon name={isFullscreen ? "Minimize2" : "Maximize2"} size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 ${isFullscreen ? 'h-full overflow-auto' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;