import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const GeographicHeatMap = ({ data, loading = false }) => {
  const [selectedArea, setSelectedArea] = useState(null);

  // Process real data or use fallback
  const geographicAreas = data && data.length > 0 ?
    data.map((item, index) => ({
      id: index + 1,
      name: item.region || 'Unknown Area',
      issues: item.issues || 0,
      lat: 28.6139 + (index * 0.05), // Mock coordinates for visualization
      lng: 77.2090 + (index * 0.05),
      severity: item.severity || 'low'
    })) : [
      { id: 1, name: 'No Data Available', issues: 0, lat: 28.6139, lng: 77.2090, severity: 'low' }
    ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-accent';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getSeverityTextColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-accent';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading geographic data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 relative">
      {/* Map Container */}
      <div className="w-full h-full bg-muted rounded-lg overflow-hidden relative">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Delhi Issues Heat Map"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=28.6139,77.2090&z=11&output=embed"
          className="border-0"
        />
        
        {/* Overlay with area markers */}
        <div className="absolute inset-0 pointer-events-none">
          {geographicAreas?.map((area) => (
            <div
              key={area?.id}
              className={`absolute w-4 h-4 rounded-full ${getSeverityColor(area?.severity)} opacity-70 pointer-events-auto cursor-pointer hover:opacity-90 transition-smooth`}
              style={{
                left: `${20 + (area?.id * 12)}%`,
                top: `${30 + (area?.id * 10)}%`
              }}
              onClick={() => setSelectedArea(area)}
              title={`${area?.name}: ${area?.issues} issues`}
            />
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-popover border border-border rounded-lg p-3 shadow-modal">
        <h4 className="text-sm font-medium text-popover-foreground mb-2">Issue Density</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span className="text-xs text-muted-foreground">High (50+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="text-xs text-muted-foreground">Medium (20-49)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-xs text-muted-foreground">Low (&lt;20)</span>
          </div>
        </div>
      </div>
      {/* Area Details Panel */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-popover border border-border rounded-lg p-4 shadow-modal">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-popover-foreground">Area Statistics</h4>
            <Button
              variant="ghost"
              size="sm"
              iconName="RotateCcw"
              iconSize={14}
              onClick={() => setSelectedArea(null)}
            >
              Reset View
            </Button>
          </div>
          
          {selectedArea ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-popover-foreground">{selectedArea?.name}</span>
                <span className={`text-sm font-medium ${getSeverityTextColor(selectedArea?.severity)}`}>
                  {selectedArea?.issues} issues
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>Severity: {selectedArea?.severity}</span>
                <span>Coordinates: {selectedArea?.lat}, {selectedArea?.lng}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {geographicAreas?.slice(0, 3)?.map((area) => (
                <div key={area?.id} className="text-center">
                  <p className="text-sm font-medium text-popover-foreground">{area?.name}</p>
                  <p className={`text-xs ${getSeverityTextColor(area?.severity)}`}>
                    {area?.issues} issues
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeographicHeatMap;