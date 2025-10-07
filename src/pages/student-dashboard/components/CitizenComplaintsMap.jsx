import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CitizenComplaintsMap = ({ complaints, userLocation }) => {
  const navigate = useNavigate();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India center
  const [mapZoom, setMapZoom] = useState(5);

  // Calculate map bounds based on complaint locations
  useEffect(() => {
    if (displayComplaints.length > 0) {
      // Calculate center of all complaint locations
      const avgLat = displayComplaints.reduce((sum, c) => sum + c.latitude, 0) / displayComplaints.length;
      const avgLng = displayComplaints.reduce((sum, c) => sum + c.longitude, 0) / displayComplaints.length;

      setMapCenter({ lat: avgLat, lng: avgLng });
      setMapZoom(12); // Zoom in when we have complaints
    }
  }, [displayComplaints]);

  // Convert lat/lng to pixel coordinates on the map
  const latLngToPixel = (lat, lng) => {
    // Use the actual map container dimensions
    const mapWidth = 800; // Match SVG viewBox width
    const mapHeight = 600; // Match SVG viewBox height

    // Scale factor for better visualization (adjust as needed)
    const scale = 2000; // Increased scale for better spread

    // Simple projection calculation
    let x = ((lng - mapCenter.lng) * scale) + (mapWidth / 2);
    let y = ((mapCenter.lat - lat) * scale) + (mapHeight / 2);

    // Ensure markers stay within map bounds with some padding
    const padding = 40;
    x = Math.max(padding, Math.min(mapWidth - padding, x));
    y = Math.max(padding, Math.min(mapHeight - padding, y));

    return { x, y };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
      case 'in_review':
        return '#3B82F6'; // Blue
      case 'assigned':
      case 'in_progress':
        return '#F59E0B'; // Orange
      case 'resolved':
        return '#10B981'; // Green
      case 'closed':
        return '#6B7280'; // Gray
      case 'rejected':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
      case 'in_review':
        return 'Clock';
      case 'assigned':
      case 'in_progress':
        return 'Settings';
      case 'resolved':
        return 'CheckCircle';
      case 'closed':
        return 'X';
      case 'rejected':
        return 'XCircle';
      default:
        return 'MapPin';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Simple map marker component
  const MapMarker = ({ complaint, isSelected, onClick }) => {
    const statusColor = getStatusColor(complaint.status);
    const statusIcon = getStatusIcon(complaint.status);

    // Convert lat/lng to pixel coordinates
    const pixelCoords = latLngToPixel(complaint.latitude, complaint.longitude);

    return (
      <div
        className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 ${
          isSelected ? 'scale-125 z-10' : 'hover:scale-110'
        }`}
        style={{
          left: `${pixelCoords.x}px`,
          top: `${pixelCoords.y}px`
        }}
        onClick={onClick}
      >
        {/* Marker pin */}
        <div className="relative">
          <div
            className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
            style={{ backgroundColor: statusColor }}
          >
            <Icon name={statusIcon} size={14} className="text-white" />
          </div>
          {/* Pin pointer */}
          <div
            className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent mx-auto"
            style={{ borderTopColor: statusColor }}
          ></div>
        </div>
      </div>
    );
  };

  const validComplaints = complaints.filter(c => c.latitude && c.longitude);
  const invalidComplaints = complaints.filter(c => !c.latitude || !c.longitude);

  // If no valid complaints with coordinates, create sample data for testing
  const testComplaints = validComplaints.length === 0 ? [
    {
      id: 'test-1',
      title: 'Sample Issue 1',
      latitude: 28.6139,
      longitude: 77.2090,
      status: 'submitted',
      address: 'Connaught Place, New Delhi'
    },
    {
      id: 'test-2',
      title: 'Sample Issue 2',
      latitude: 28.7041,
      longitude: 77.1025,
      status: 'in_progress',
      address: 'Karol Bagh, New Delhi'
    },
    {
      id: 'test-3',
      title: 'Sample Issue 3',
      latitude: 28.5355,
      longitude: 77.3910,
      status: 'resolved',
      address: 'Noida, Uttar Pradesh'
    }
  ] : [];

  const displayComplaints = validComplaints.length > 0 ? validComplaints : testComplaints;

  // Debug logging
  console.log('Map Debug Info:', {
    totalComplaints: complaints.length,
    validComplaints: validComplaints.length,
    invalidComplaints: invalidComplaints.length,
    usingTestData: validComplaints.length === 0,
    displayComplaints: displayComplaints.length,
    mapCenter,
    sampleValidComplaint: validComplaints[0] ? {
      id: validComplaints[0].id,
      latitude: validComplaints[0].latitude,
      longitude: validComplaints[0].longitude,
      address: validComplaints[0].address
    } : null
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Complaints Map</h2>
          <p className="text-muted-foreground mt-1">
            View all your complaints marked on the map with their current status
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="MapPin" size={16} />
          <span>{validComplaints.length} of {complaints.length} complaints have location data {validComplaints.length === 0 && '(showing sample data)'}</span>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{displayComplaints.filter(c => c.status === 'submitted' || c.status === 'in_review').length}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{displayComplaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{displayComplaints.filter(c => c.status === 'resolved').length}</div>
          <div className="text-sm text-muted-foreground">Resolved</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{displayComplaints.filter(c => c.status === 'closed' || c.status === 'rejected').length}</div>
          <div className="text-sm text-muted-foreground">Closed</div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50">
          <>
            {/* Simple Map Background */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 800 600" className="w-full h-full">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Map Markers */}
            {displayComplaints.map((complaint) => (
              <MapMarker
                key={complaint.id}
                complaint={complaint}
                isSelected={selectedComplaint?.id === complaint.id}
                onClick={() => setSelectedComplaint(complaint)}
              />
            ))}
          </>

          {/* Selected Complaint Info */}
          {selectedComplaint && (
            <div className="absolute top-4 left-4 bg-white border border-border rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-card-foreground line-clamp-2">
                  {selectedComplaint.title}
                </h3>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-muted-foreground hover:text-card-foreground ml-2"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getStatusColor(selectedComplaint.status) }}
                  ></div>
                  <span className="text-muted-foreground capitalize">
                    {selectedComplaint.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Icon name="MapPin" size={12} />
                  <span className="line-clamp-1">{selectedComplaint.address}</span>
                </div>

                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Icon name="Calendar" size={12} />
                  <span>{formatDate(selectedComplaint.created_at)}</span>
                </div>

                {selectedComplaint.latitude && selectedComplaint.longitude && (
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Icon name="Navigation" size={12} />
                    <span>{selectedComplaint.latitude.toFixed(6)}, {selectedComplaint.longitude.toFixed(6)}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => navigate(`/issue/${selectedComplaint.id}`)}
                className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                View Details
              </Button>
            </div>
          )}

          {/* Map Legend */}
          <div className="absolute bottom-4 right-4 bg-white border border-border rounded-lg p-3 shadow-lg">
            <h4 className="text-sm font-semibold text-card-foreground mb-2">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-muted-foreground">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-muted-foreground">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Resolved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-muted-foreground">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints without GPS */}
      {invalidComplaints.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="AlertTriangle" size={20} className="text-orange-500" />
            <h3 className="text-lg font-semibold text-card-foreground">
              Complaints without Location Data
            </h3>
          </div>
          <p className="text-muted-foreground mb-4">
            The following complaints don't have GPS coordinates and cannot be displayed on the map:
          </p>
          <div className="space-y-2">
            {invalidComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                onClick={() => navigate(`/issue/${complaint.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-card-foreground truncate">{complaint.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{complaint.address || 'No address'}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status?.replace('_', ' ')?.toUpperCase()}
                  </span>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Map Instructions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click on any marker to view complaint details</li>
              <li>• Markers are color-coded by complaint status</li>
              <li>• GPS coordinates are shown for each complaint</li>
              <li>• Complaints without location data are listed below</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenComplaintsMap;