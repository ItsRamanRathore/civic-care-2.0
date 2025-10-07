import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DateRangeSelector = ({ onDateRangeChange, className = "" }) => {
  const [selectedRange, setSelectedRange] = useState('30d');
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustom, setShowCustom] = useState(false);

  const predefinedRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    
    if (range === 'custom') {
      setShowCustom(true);
      return;
    }
    
    setShowCustom(false);
    
    const endDate = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate?.setDate(endDate?.getDate() - 7);
        break;
      case '30d':
        startDate?.setDate(endDate?.getDate() - 30);
        break;
      case '90d':
        startDate?.setDate(endDate?.getDate() - 90);
        break;
      case '1y':
        startDate?.setFullYear(endDate?.getFullYear() - 1);
        break;
      default:
        break;
    }
    
    onDateRangeChange?.({
      startDate: startDate?.toISOString()?.split('T')?.[0],
      endDate: endDate?.toISOString()?.split('T')?.[0],
      range
    });
  };

  const handleCustomRangeApply = () => {
    if (customRange?.startDate && customRange?.endDate) {
      onDateRangeChange?.({
        startDate: customRange?.startDate,
        endDate: customRange?.endDate,
        range: 'custom'
      });
      setShowCustom(false);
    }
  };

  const formatDateRange = () => {
    if (selectedRange === 'custom' && customRange?.startDate && customRange?.endDate) {
      return `${new Date(customRange.startDate)?.toLocaleDateString()} - ${new Date(customRange.endDate)?.toLocaleDateString()}`;
    }
    
    const selected = predefinedRanges?.find(r => r?.value === selectedRange);
    return selected?.label || 'Select range';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <Icon name="Calendar" size={16} className="text-muted-foreground" />
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustom(!showCustom)}
            className="min-w-[140px] justify-between"
          >
            <span className="text-sm">{formatDateRange()}</span>
            <Icon name="ChevronDown" size={14} />
          </Button>
          
          {showCustom && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-md shadow-modal z-50 p-4">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-popover-foreground">Select Date Range</h4>
                
                {/* Predefined ranges */}
                <div className="space-y-2">
                  {predefinedRanges?.map((range) => (
                    <button
                      key={range?.value}
                      onClick={() => handleRangeSelect(range?.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-smooth ${
                        selectedRange === range?.value
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-popover-foreground'
                      }`}
                    >
                      {range?.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom date inputs */}
                {selectedRange === 'custom' && (
                  <div className="space-y-3 pt-3 border-t border-border">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customRange?.startDate}
                        onChange={(e) => setCustomRange(prev => ({ ...prev, startDate: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customRange?.endDate}
                        onChange={(e) => setCustomRange(prev => ({ ...prev, endDate: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleCustomRangeApply}
                        disabled={!customRange?.startDate || !customRange?.endDate}
                        className="flex-1"
                      >
                        Apply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustom(false);
                          setSelectedRange('30d');
                          handleRangeSelect('30d');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector;