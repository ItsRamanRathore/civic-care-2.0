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
      <div className="bg-white rounded-[40px] border border-neutral-100 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
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
    <div className="bg-white rounded-[40px] border border-neutral-100 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)] transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-[16px] flex items-center justify-center">
          <Icon name={icon} size={24} className="text-indigo-600" />
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