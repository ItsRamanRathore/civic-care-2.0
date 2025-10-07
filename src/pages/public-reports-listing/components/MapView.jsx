import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MapView = ({ issues, onIssueSelect, selectedIssue }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [zoom, setZoom] = useState(12);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Debug log to see what data we're getting
  console.log('🗺️ MapView received issues:', issues);
  console.log('📍 Issues with coordinates:', issues?.filter(issue => issue?.coordinates));

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLoc = { lat: latitude, lng: longitude };
          setUserLocation(userLoc);
          setMapCenter(userLoc);
          setZoom(15); // Zoom in more when showing user location
          console.log('📍 User location detected:', userLoc);
        },
        (error) => {
          console.warn('❌ Could not get user location:', error.message);
          setLocationError(error.message);
          // Keep default Delhi location
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      console.warn('❌ Geolocation not supported');
      setLocationError('Geolocation not supported');
    }
  }, []);

  // Cluster issues for map display
  const clusterIssues = (issues) => {
    if (!issues || issues.length === 0) return [];
    
    const clusters = [];
    const processed = new Set();

    // Filter issues that have valid coordinates
    const validIssues = issues.filter(issue => 
      issue?.coordinates && 
      typeof issue.coordinates.lat === 'number' && 
      typeof issue.coordinates.lng === 'number' &&
      !isNaN(issue.coordinates.lat) && 
      !isNaN(issue.coordinates.lng)
    );

    console.log('🔍 Valid issues with coordinates:', validIssues.length);

    validIssues?.forEach((issue, index) => {
      if (processed?.has(index)) return;

      const cluster = {
        id: `cluster-${issue.id || index}`,
        lat: issue.coordinates.lat,
        lng: issue.coordinates.lng,
        issues: [issue],
        count: 1
      };

      // Find nearby issues to cluster
      validIssues?.forEach((otherIssue, otherIndex) => {
        if (processed?.has(otherIndex) || index === otherIndex) return;

        const distance = Math.sqrt(
          Math.pow(cluster.lat - otherIssue.coordinates.lat, 2) +
          Math.pow(cluster.lng - otherIssue.coordinates.lng, 2)
        );

        if (distance < 0.01) { // Cluster nearby issues (about 1km)
          cluster.issues.push(otherIssue);
          cluster.count++;
          processed.add(otherIndex);
        }
      });

      processed.add(index);
      clusters.push(cluster);
    });

    console.log('📍 Created clusters:', clusters.length);
    return clusters;
  };

  const clusters = clusterIssues(issues);

  const getClusterColor = (count) => {
    if (count === 1) return 'bg-primary';
    if (count <= 5) return 'bg-warning';
    return 'bg-destructive';
  };

  const handleClusterClick = (cluster) => {
    if (cluster?.count === 1) {
      onIssueSelect?.(cluster?.issues?.[0]);
    } else {
      // Zoom in to show individual issues
      setMapCenter({ lat: cluster?.lat, lng: cluster?.lng });
      setZoom(Math.min(zoom + 2, 18));
    }
  };

  const resetView = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setZoom(15);
    } else {
      setMapCenter({ lat: 28.6139, lng: 77.2090 });
      setZoom(12);
    }
  };

  const goToUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLoc = { lat: latitude, lng: longitude };
          setUserLocation(userLoc);
          setMapCenter(userLoc);
          setZoom(15);
        },
        (error) => {
          console.warn('Could not get user location:', error.message);
          setLocationError(error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
      {/* Map Header */}
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Map" size={20} className="text-primary" />
            <h3 className="font-heading font-semibold text-lg">Issue Map View</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              iconName="RotateCcw"
              iconSize={14}
            >
              Reset View
            </Button>
            <div className="text-sm text-muted-foreground">
              {issues?.length} issues
            </div>
          </div>
        </div>
      </div>
      {/* Map Container */}
      <div className="relative h-96 bg-muted">
        {/* Google Maps Iframe */}
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Issues Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${mapCenter?.lat},${mapCenter?.lng}&z=${zoom}&output=embed`}
          className="absolute inset-0"
        />

        {/* Overlay with Issue Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Test marker at map center */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
            style={{
              left: '50%',
              top: '50%'
            }}
            title="Map Center"
          >
            <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shadow-lg hover:scale-110 transition-all duration-200 border-2 border-white hover:border-red-300">
              C
            </div>
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Map Center
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          
          {clusters?.map((cluster, index) => {
            console.log(`📍 Rendering cluster ${index}:`, cluster);
            return (
              <div
                key={cluster?.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                style={{
                  left: `${50 + (cluster?.lng - mapCenter?.lng) * Math.pow(2, zoom) * 50}%`,
                  top: `${50 - (cluster?.lat - mapCenter?.lat) * Math.pow(2, zoom) * 50}%`
                }}
                onClick={() => handleClusterClick(cluster)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.zIndex = '1';
                }}
              >
                <div className={`w-8 h-8 rounded-full ${getClusterColor(cluster?.count)} text-white flex items-center justify-center text-sm font-bold shadow-lg hover:scale-110 transition-all duration-200 cursor-pointer border-2 border-white hover:border-blue-300`}>
                  {cluster?.count}
                </div>
                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {cluster?.count === 1 ? '1 complaint' : `${cluster?.count} complaints`}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(Math.min(zoom + 1, 18))}
            className="bg-background/90 backdrop-blur-sm cursor-pointer hover:bg-background transition-colors"
            title="Zoom In"
          >
            <Icon name="Plus" size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(Math.max(zoom - 1, 1))}
            className="bg-background/90 backdrop-blur-sm cursor-pointer hover:bg-background transition-colors"
            title="Zoom Out"
          >
            <Icon name="Minus" size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToUserLocation}
            className="bg-background/90 backdrop-blur-sm cursor-pointer hover:bg-background transition-colors"
            title="Go to My Location"
          >
            <Icon name="Crosshair" size={16} />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded-full" />
              <span>Single Issue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning rounded-full" />
              <span>2-5 Issues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-destructive rounded-full" />
              <span>5+ Issues</span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
              <Icon name="MapPin" size={12} className="text-success" />
              <span>GPS Coordinates</span>
            </div>
          </div>
        </div>

        {/* Location Status */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs">
          <div className="font-medium mb-1">Map Status</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>{userLocation ? 'Your Location' : 'Default Location'}</span>
            </div>
            <div>Total Issues: {issues?.length || 0}</div>
            <div>Visible Markers: {clusters?.length || 0}</div>
            {locationError && (
              <div className="text-red-500 text-xs">Location Error: {locationError}</div>
            )}
          </div>
        </div>
      </div>
      {/* Selected Issue Details */}
      {selectedIssue && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
              <img
                src={selectedIssue?.image}
                alt={selectedIssue?.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/images/no_image.png';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-card-foreground truncate">
                {selectedIssue?.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {selectedIssue?.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon name="MapPin" size={12} />
                  <span className="truncate">{selectedIssue?.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" size={12} />
                  <span>{new Date(selectedIssue.createdAt)?.toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              {selectedIssue?.coordinates && (
                <div className="mt-2 p-2 bg-muted rounded text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-card-foreground">📍 GPS: </span>
                      <span className="font-mono text-muted-foreground">
                        {selectedIssue?.coordinates?.lat?.toFixed(4)}, {selectedIssue?.coordinates?.lng?.toFixed(4)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(`${selectedIssue?.coordinates?.lat?.toFixed(6)}, ${selectedIssue?.coordinates?.lng?.toFixed(6)}`);
                      }}
                      className="text-primary hover:underline cursor-pointer transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onIssueSelect?.(null)}
              className="shrink-0 cursor-pointer hover:bg-muted transition-colors"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;