import React, { useState } from 'react';

import Icon from '../../../components/AppIcon';

const ReportingTips = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState('effective');

  const tips = {
    effective: {
      title: 'Effective Reporting',
      icon: 'Lightbulb',
      items: [
        {
          title: 'Be Specific',
          description: 'Provide exact location details and clear description of the issue',
          icon: 'Target'
        },
        {
          title: 'Include Photos',
          description: 'Visual evidence helps authorities understand the problem better',
          icon: 'Camera'
        },
        {
          title: 'Mention Urgency',
          description: 'Indicate if the issue poses immediate safety risks',
          icon: 'AlertTriangle'
        },
        {
          title: 'Provide Context',
          description: 'Mention how long the issue has existed and its impact',
          icon: 'Clock'
        }
      ]
    },
    categories: {
      title: 'Category Guidelines',
      icon: 'Tag',
      items: [
        {
          title: 'Roads & Transportation',
          description: 'Potholes, broken signals, road damage, parking issues',
          icon: 'Car'
        },
        {
          title: 'Sanitation & Cleanliness',
          description: 'Garbage collection, public toilets, drainage problems',
          icon: 'Trash2'
        },
        {
          title: 'Utilities',
          description: 'Water supply, electricity, gas connections, internet',
          icon: 'Zap'
        },
        {
          title: 'Public Infrastructure',
          description: 'Parks, buildings, streetlights, public facilities',
          icon: 'Building'
        }
      ]
    },
    process: {
      title: 'What Happens Next',
      icon: 'ArrowRight',
      items: [
        {
          title: 'AI Validation',
          description: 'Your report will be automatically validated for accuracy',
          icon: 'Bot'
        },
        {
          title: 'Department Assignment',
          description: 'Issue will be assigned to the relevant government department',
          icon: 'Users'
        },
        {
          title: 'Status Updates',
          description: 'You\'ll receive notifications about progress and resolution',
          icon: 'Bell'
        },
        {
          title: 'Resolution Tracking',
          description: 'Track the issue until it\'s completely resolved',
          icon: 'CheckCircle'
        }
      ]
    }
  };

  const tabs = [
    { key: 'effective', label: 'Tips', icon: 'Lightbulb' },
    { key: 'categories', label: 'Categories', icon: 'Tag' },
    { key: 'process', label: 'Process', icon: 'ArrowRight' }
  ];

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-primary/5 border-b border-border p-4">
        <div className="flex items-center space-x-2">
          <Icon name="Info" size={18} className="text-primary" />
          <h3 className="font-medium text-text-primary">Reporting Guide</h3>
        </div>
      </div>
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex">
          {tabs?.map((tab) => (
            <button
              key={tab?.key}
              onClick={() => setActiveTab(tab?.key)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 text-sm font-medium transition-colors ${
                activeTab === tab?.key
                  ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-text-primary hover:bg-muted'
              }`}
            >
              <Icon name={tab?.icon} size={14} />
              <span className="hidden sm:inline">{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name={tips?.[activeTab]?.icon} size={16} className="text-primary" />
            <h4 className="font-medium text-text-primary">{tips?.[activeTab]?.title}</h4>
          </div>

          <div className="space-y-3">
            {tips?.[activeTab]?.items?.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md">
                <div className="mt-0.5">
                  <Icon name={item?.icon} size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-text-primary mb-1">
                    {item?.title}
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="bg-muted/30 border-t border-border p-4">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Icon name="Shield" size={14} />
          <span>Your reports help improve our community. Thank you for your participation!</span>
        </div>
      </div>
    </div>
  );
};

export default ReportingTips;