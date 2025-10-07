import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const LocationSelector = ({ location, onLocationChange, error, className = "" }) => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi default

  const handleAddressChange = (e) => {
    onLocationChange({
      ...location,
      address: e?.target?.value
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position?.coords;
        const newLocation = {
          ...location,
          coordinates: { lat: latitude, lng: longitude },
          address: location?.address || `GPS: ${latitude?.toFixed(6)}, ${longitude?.toFixed(6)}`
        };
        setMapCenter({ lat: latitude, lng: longitude });
        onLocationChange(newLocation);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please enter address manually.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Show auto-capture indicator when coordinates are present
  useEffect(() => {
    if (location?.coordinates) {
      setIsAutoCapturing(true);
      const timer = setTimeout(() => setIsAutoCapturing(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location?.coordinates]);

  const handleMapClick = (lat, lng) => {
    const newLocation = {
      ...location,
      coordinates: { lat, lng },
      address: location?.address || `${lat?.toFixed(6)}, ${lng?.toFixed(6)}`
    };
    onLocationChange(newLocation);
  };

  const toggleMap = () => {
    setIsMapVisible(!isMapVisible);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Icon name="MapPin" size={18} className="text-primary" />
        <h3 className="text-sm font-medium text-text-primary">Issue Location</h3>
        <span className="text-accent">*</span>
      </div>
      {/* Address Input */}
      <div className="space-y-2">
        <Input
          label="Address"
          type="text"
          placeholder="Enter the address where the issue is located"
          value={location?.address || ''}
          onChange={handleAddressChange}
          error={error}
          required
          description="Provide a detailed address including landmarks if possible"
        />
        
        {/* Auto-capture GPS indicator */}
        {isAutoCapturing && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center space-x-2">
              <div className="animate-spin">
                <Icon name="Crosshair" size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">📍 GPS Coordinates Captured</p>
                <p className="text-xs text-blue-600">
                  Your current location coordinates have been automatically detected. Please enter the detailed address above.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Location Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          loading={isGettingLocation}
          iconName="Crosshair"
          iconPosition="left"
          iconSize={16}
        >
          Use Current Location
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMap}
          iconName={isMapVisible ? "EyeOff" : "Map"}
          iconPosition="left"
          iconSize={16}
        >
          {isMapVisible ? "Hide Map" : "Show Map"}
        </Button>
      </div>
      {/* Interactive Map */}
      {isMapVisible && (
        <div className="space-y-3">
          <div className="bg-muted rounded-lg overflow-hidden border border-border">
            <div className="h-64 w-full relative">
              <iframe
                width="100%"
                height="100%"
                loading="lazy"
                title="Issue Location Map"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapCenter?.lat},${mapCenter?.lng}&z=15&output=embed`}
                className="border-0"
              />
              {location?.coordinates && (
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-text-primary">
                  📍 {location?.coordinates?.lat?.toFixed(6)}, {location?.coordinates?.lng?.toFixed(6)}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-md p-3">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-text-primary mb-1">Map Instructions:</p>
                <ul className="space-y-1">
                  <li>• Use "Current Location" to automatically detect your position</li>
                  <li>• The red marker shows the selected location</li>
                  <li>• Ensure the marker is placed exactly where the issue exists</li>
                  <li>• Accurate location helps authorities respond faster</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Coordinates Display */}
      {location?.coordinates && (
        <div className="bg-success/10 border border-success/20 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} className="text-success" />
            <span className="text-sm font-medium text-success">GPS Coordinates Captured</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Coordinates: {location?.coordinates?.lat?.toFixed(6)}, {location?.coordinates?.lng?.toFixed(6)}
          </p>
          <p className="text-xs text-amber-600 mt-1 font-medium">
            ⚠️ Please still enter the detailed address above for better location description
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;