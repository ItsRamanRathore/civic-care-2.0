import React, { useState, useEffect, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different categories
const createCustomIcon = (category, status) => {
  const categoryColors = {
    'roads': '#E63946',
    'sanitation': '#F77F00',
    'utilities': '#FCBF49',
    'safety': '#277DA1',
    'environment': '#43AA8B',
    'transport': '#90E0EF'
  };
  
  const color = categoryColors[category] || '#6C757D';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
        ${status === 'resolved' ? '<div style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background-color: #10B981; border: 2px solid white; border-radius: 50%;"></div>' : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Component to handle map events and updates
const MapEventHandler = ({ mapCenter, mapZoom, onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (mapCenter) {
      map.setView([mapCenter.lat, mapCenter.lng], mapZoom);
    }
  }, [map, mapCenter, mapZoom]);
  
  useEffect(() => {
    onMapReady?.(map);
  }, [map, onMapReady]);
  
  return null;
};

const MapContainer = ({ 
  issues = [], 
  selectedIssue, 
  onIssueSelect, 
  onMapClick,
  searchLocation,
  searchRadius,
  activeLayers = [],
  isDrawingMode = false,
  className = ""
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [mapZoom, setMapZoom] = useState(11);
  const [userLocation, setUserLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLoc = { lat: latitude, lng: longitude };
          setUserLocation(userLoc);
          setMapCenter(userLoc);
          setMapZoom(15); // Zoom in more when showing user location
          console.log('📍 User location detected:', userLoc);
        },
        (error) => {
          console.warn('❌ Could not get user location:', error.message);
          // Keep default Delhi location
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  useEffect(() => {
    if (searchLocation) {
      setMapCenter(searchLocation?.coordinates);
      setMapZoom(15);
    }
  }, [searchLocation]);

  // Filter issues that have valid coordinates
  const validIssues = issues.filter(issue => 
    issue?.coordinates?.lat && 
    issue?.coordinates?.lng &&
    !isNaN(issue.coordinates.lat) &&
    !isNaN(issue.coordinates.lng)
  );

  console.log('📍 Map Debug:', {
    totalIssues: issues.length,
    validIssues: validIssues.length,
    mapCenter,
    mapZoom,
    sampleIssue: validIssues[0] ? {
      id: validIssues[0].id,
      title: validIssues[0].title,
      coordinates: validIssues[0].coordinates,
      category: validIssues[0].category
    } : null
  });

  const handleMarkerClick = (issue) => {
    console.log('Marker clicked:', issue.id);
    onIssueSelect(issue);
  };

  const handleRecenter = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(15);
    } else {
      setMapCenter({ lat: 28.6139, lng: 77.2090 });
      setMapZoom(11);
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <LeafletMapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler 
          mapCenter={mapCenter} 
          mapZoom={mapZoom}
          onMapReady={setMapInstance}
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background-color: #3B82F6;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  animation: pulse 2s infinite;
                "></div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                </style>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
                <br />
                <small>{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Issue markers */}
        {validIssues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.coordinates.lat, issue.coordinates.lng]}
            icon={createCustomIcon(issue.category, issue.status)}
            eventHandlers={{
              click: () => handleMarkerClick(issue)
            }}
          >
            <Popup>
              <div className="min-w-64 max-w-sm">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2 pr-2">
                    {issue.title}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {issue.status?.replace('_', ' ')?.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                  {issue.description}
                </p>
                
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>📍</span>
                    <span className="line-clamp-1">{issue.address}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🏷️</span>
                    <span className="capitalize">{issue.category?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>📅</span>
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🎯</span>
                    <span>{issue.coordinates.lat.toFixed(6)}, {issue.coordinates.lng.toFixed(6)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleMarkerClick(issue)}
                  className="w-full mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMapContainer>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={handleRecenter}
          className="bg-white shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
          title="Recenter Map"
        >
          <Icon name="Home" size={16} />
        </Button>
      </div>

      {/* Map Status Indicator */}
      <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded px-3 py-1 shadow-lg z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs text-gray-700">
            {validIssues?.length} issues visible
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          📍 GPS coordinates enabled
        </div>
      </div>

      {/* No issues message */}
      {validIssues.length === 0 && issues.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg border">
            <Icon name="MapPin" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No GPS Coordinates Available
            </h3>
            <p className="text-gray-600 mb-4">
              {issues.length} issues found, but none have GPS coordinates to display on the map.
            </p>
            <p className="text-sm text-gray-500">
              Issues need latitude and longitude data to be shown on the map.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;