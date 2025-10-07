import React from 'react';
import Icon from '../../../components/AppIcon';

const RealTimeIndicator = ({ 
  isEnabled = false, 
  lastUpdated = null, 
  connectionStatus = 'connected',
  size = 'sm' 
}) => {
  const getStatusColor = () => {
    if (!isEnabled) return 'text-gray-500';
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    if (!isEnabled) return 'Manual Mode';
    switch (connectionStatus) {
      case 'connected': return 'Live';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString();
  };

  if (size === 'lg') {
    return (
      <div className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg">
        <div className="flex items-center space-x-2">
          {isEnabled && connectionStatus === 'connected' && (
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          )}
          {isEnabled && connectionStatus === 'connecting' && (
            <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          )}
          {isEnabled && connectionStatus === 'disconnected' && (
            <Icon name="WifiOff" size={12} className="text-red-600" />
          )}
          {!isEnabled && (
            <Icon name="Pause" size={12} className="text-gray-500" />
          )}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            Updated {formatLastUpdated(lastUpdated)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      {isEnabled && connectionStatus === 'connected' && (
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      )}
      {isEnabled && connectionStatus === 'connecting' && (
        <div className="w-2 h-2 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      )}
      {isEnabled && connectionStatus === 'disconnected' && (
        <Icon name="WifiOff" size={10} className="text-red-600" />
      )}
      {!isEnabled && (
        <Icon name="Pause" size={10} className="text-gray-500" />
      )}
      <span className={`text-xs font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
};

export default RealTimeIndicator;