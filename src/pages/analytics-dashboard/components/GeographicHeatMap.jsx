import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../../../components/ui/Button';

// Fix for leaflet marker icons (though we're using CircleMarker, it's good practice)
import L from 'leaflet';

const GeographicHeatMap = ({ data, loading = false }) => {
  const [selectedArea, setSelectedArea] = useState(null);

  // Process real data or use fallback
  const geographicAreas = (data || [])?.length > 0 ?
    data.map((item, index) => ({
      id: index + 1,
      name: item.region || 'Unknown Area',
      issues: Number(item.issues) || 0,
      lat: Number(item.lat) || (28.6139 + (Math.random() - 0.5) * 0.1),
      lng: Number(item.lng) || (77.2090 + (Math.random() - 0.5) * 0.1),
      severity: item.severity || 'low'
    })) : [
      { id: 1, name: 'Central Ward', issues: 45, lat: 28.6139, lng: 77.2090, severity: 'high' },
      { id: 2, name: 'North Ward', issues: 12, lat: 28.6539, lng: 77.2090, severity: 'low' },
      { id: 3, name: 'South Ward', issues: 28, lat: 28.5739, lng: 77.2090, severity: 'medium' },
      { id: 4, name: 'East Ward', issues: 52, lat: 28.6139, lng: 77.2590, severity: 'high' },
      { id: 5, name: 'West Ward', issues: 18, lat: 28.6139, lng: 77.1590, severity: 'low' }
    ];

  const getSeverityColorHex = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444'; // text-red-500
      case 'medium': return '#f59e0b'; // text-amber-500
      case 'low': return '#10b981'; // text-emerald-500
      default: return '#6b7280';
    }
  };

  const getSeverityTextColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-neutral-500';
    }
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm font-bold text-neutral-400">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] relative rounded-[32px] overflow-hidden border border-neutral-100">
      {/* Map Container */}
      <div className="w-full h-full bg-neutral-50 relative z-0">
        <MapContainer 
          center={[28.6139, 77.2090]} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {geographicAreas?.map((area) => (
            <CircleMarker
              key={area.id}
              center={[area.lat, area.lng]}
              radius={Math.max(12, Math.min(35, area.issues / 1.5))}
              pathOptions={{
                color: getSeverityColorHex(area.severity),
                fillColor: getSeverityColorHex(area.severity),
                fillOpacity: 0.5,
                weight: 2
              }}
              eventHandlers={{
                click: () => setSelectedArea(area),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[150px]">
                  <h4 className="font-black text-neutral-900 mb-1">{area.name}</h4>
                  <p className="text-sm font-bold text-neutral-600 mb-3">{area.issues} Active Issues</p>
                  <span className={`text-[10px] uppercase font-black tracking-[0.1em] px-3 py-1.5 rounded-full ${
                    area.severity === 'high' ? 'bg-red-50 text-red-600' :
                    area.severity === 'medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {area.severity} Priority
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      
      {/* Legend overlaying the map */}
      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-[1000]">
        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Issue Density</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)]"></div>
            <span className="text-xs font-bold text-neutral-700">High (50+)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"></div>
            <span className="text-xs font-bold text-neutral-700">Medium (20-49)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)]"></div>
            <span className="text-xs font-bold text-neutral-700">Low (&lt;20)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicHeatMap;