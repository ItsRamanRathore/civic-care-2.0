import React from 'react';
import Icon from '../../../components/AppIcon';

const CitizenMetricsCard = ({ title, value, change, changeType, icon, description }) => {
  const getCardStyles = (type) => {
    switch (type) {
      case 'positive':
        return {
          gradient: 'from-green-500 to-emerald-600',
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          changeColor: 'text-green-700'
        };
      case 'warning':
        return {
          gradient: 'from-amber-500 to-orange-600',
          bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
          border: 'border-amber-200',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          changeColor: 'text-amber-700'
        };
      case 'negative':
        return {
          gradient: 'from-red-500 to-rose-600',
          bg: 'bg-gradient-to-br from-red-50 to-rose-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          changeColor: 'text-red-700'
        };
      default:
        return {
          gradient: 'from-teal-500 to-emerald-600',
          bg: 'bg-gradient-to-br from-teal-50 to-emerald-50',
          border: 'border-teal-200',
          iconBg: 'bg-teal-100',
          iconColor: 'text-teal-600',
          changeColor: 'text-teal-700'
        };
    }
  };

  const styles = getCardStyles(changeType);

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group`}>
      {/* Gradient overlay */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${styles.gradient}`}></div>
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-3 group-hover:scale-105 transition-transform duration-200">{value}</h3>
          {change && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${styles.iconBg}`}></div>
              <p className={`text-sm font-medium ${styles.changeColor}`}>
                {change}
              </p>
            </div>
          )}
          {description && (
            <p className="text-sm text-gray-500 mt-2">{description}</p>
          )}
        </div>
        {icon && (
          <div className={`${styles.iconBg} p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-all duration-200`}>
            <Icon name={icon} className={`h-7 w-7 ${styles.iconColor}`} />
          </div>
        )}
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white to-transparent pointer-events-none"></div>
    </div>
  );
};

export default CitizenMetricsCard;
