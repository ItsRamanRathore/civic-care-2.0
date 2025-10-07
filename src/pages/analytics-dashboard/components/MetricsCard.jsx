import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, change, changeType, icon, description, loading = false }) => {
  const getChangeIcon = () => {
    if (changeType === 'increase') return 'TrendingUp';
    if (changeType === 'decrease') return 'TrendingDown';
    return 'Minus';
  };

  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-success';
    if (changeType === 'decrease') return 'text-accent';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-muted rounded-lg"></div>
            <div className="w-16 h-4 bg-muted rounded"></div>
          </div>
          <div className="w-20 h-8 bg-muted rounded mb-2"></div>
          <div className="w-24 h-4 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-modal transition-smooth">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name={icon} size={20} className="text-primary" />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
            <Icon name={getChangeIcon()} size={14} />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-card-foreground">{value}</h3>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;