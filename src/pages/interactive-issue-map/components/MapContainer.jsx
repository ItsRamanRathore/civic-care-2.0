import React, { useState, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.heat';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import 'leaflet/dist/leaflet.css';
import RoutingMachine from './RoutingMachine';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
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
    html: `<div style="width: 32px; height: 32px; background-color: ${color}; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative;">
        <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
        ${status === 'resolved' ? '<div style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background-color: #10B981; border: 2px solid white; border-radius: 50%;"></div>' : ''}
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const MapEventHandler = ({ mapCenter, mapZoom, onMapReady }) => {
  const map = useMap();
  useEffect(() => { if (mapCenter) map.setView([mapCenter.lat, mapCenter.lng], mapZoom); }, [map, mapCenter, mapZoom]);
  useEffect(() => { onMapReady?.(map); }, [map, onMapReady]);
  return null;
};

const HeatmapLayer = ({ issues }) => {
  const map = useMap();
  useEffect(() => {
    if (!issues || issues.length === 0) return;
    const heatData = issues.filter(i => i.coordinates).map(i => [i.coordinates.lat, i.coordinates.lng, i.priority === 'critical' ? 1.0 : 0.5]);
    const layer = L.heatLayer(heatData, { radius: 25, blur: 15, maxZoom: 17 });
    layer.addTo(map);
    return () => { if (map) map.removeLayer(layer); };
  }, [map, issues]);
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
  plannedRoute = null,
  routeStops = [],
  className = ""
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [mapZoom, setMapZoom] = useState(11);
  const [userLocation, setUserLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [viewMode, setViewMode] = useState('cluster');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => { 
          const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
          setUserLocation(loc); setMapCenter(loc); setMapZoom(15);
        },
        (e) => console.warn(e.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => { if (searchLocation) { setMapCenter(searchLocation.coordinates); setMapZoom(15); } }, [searchLocation]);

  const validIssues = (issues || []).filter(i => i.coordinates?.lat && i.coordinates?.lng);
  const handleMarkerClick = (issue) => onIssueSelect?.(issue);
  const handleRecenter = () => {
    if (userLocation) { setMapCenter(userLocation); setMapZoom(15); }
    else { setMapCenter({ lat: 28.6139, lng: 77.2090 }); setMapZoom(11); }
  };

  const waypoints = routeStops.filter(s => s.coordinates).map(s => ({
    lat: s.coordinates.lat,
    lng: s.coordinates.lng
  }));

  return (
    <div className={`relative w-full h-full ${className}`}>
      <LeafletMapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={mapZoom} style={{ height: '100%', width: '100%' }} className="z-0">
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {waypoints.length >= 2 && (
          <RoutingMachine waypoints={waypoints} />
        )}


        <MapEventHandler mapCenter={mapCenter} mapZoom={mapZoom} onMapReady={setMapInstance} />
        
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({
            className: 'user-marker',
            html: `<div style="width: 20px; height: 20px; background-color: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>`,
            iconSize: [20, 20], iconAnchor: [10, 10]
          })}>
            <Popup><strong>You are here</strong></Popup>
          </Marker>
        )}
        
        {viewMode === 'heat' ? (
          <HeatmapLayer issues={validIssues} />
        ) : (
          <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
            {validIssues.map((issue) => (
              <Marker key={issue._id || issue.id} position={[issue.coordinates.lat, issue.coordinates.lng]} icon={createCustomIcon(issue.category, issue.status)} eventHandlers={{ click: () => handleMarkerClick(issue) }}>
                <Popup>
                  <div className="min-w-64 p-1">
                    <h3 className="font-bold text-sm mb-1">{issue.title}</h3>
                    <p className="text-xs text-gray-600 mb-3">{issue.description}</p>
                    <button onClick={() => handleMarkerClick(issue)} className="w-full py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-md hover:bg-blue-700 transition-colors">VIEW DETAILS</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </LeafletMapContainer>

      <div className="absolute top-4 left-4 flex bg-white/95 backdrop-blur rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
        <button onClick={() => setViewMode('cluster')} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'cluster' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Icon name="MapPin" size={14} /> MARKERS
        </button>
        <button onClick={() => setViewMode('heat')} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'heat' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Icon name="Flame" size={14} /> HEATMAP
        </button>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col space-y-3 z-20">
        <Button variant="outline" size="icon" onClick={handleRecenter} className="bg-white shadow-xl hover:scale-105 transition-transform">
          <Icon name="Home" size={18} />
        </Button>
      </div>
    </div>
  );
};

export default MapContainer;