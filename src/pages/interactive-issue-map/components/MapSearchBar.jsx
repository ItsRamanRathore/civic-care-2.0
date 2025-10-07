import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MapSearchBar = ({ onLocationSearch, onRadiusSearch, className = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(1);
  const [showRadiusControls, setShowRadiusControls] = useState(false);
  const searchRef = useRef(null);

  const mockLocationSuggestions = [
    {
      id: 1,
      name: 'Connaught Place',
      address: 'Connaught Place, New Delhi, Delhi 110001',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      type: 'landmark'
    },
    {
      id: 2,
      name: 'India Gate',
      address: 'Rajpath, India Gate, New Delhi, Delhi 110003',
      coordinates: { lat: 28.6129, lng: 77.2295 },
      type: 'landmark'
    },
    {
      id: 3,
      name: 'Sector 18, Noida',
      address: 'Sector 18, Noida, Uttar Pradesh 201301',
      coordinates: { lat: 28.5706, lng: 77.3272 },
      type: 'area'
    },
    {
      id: 4,
      name: 'Cyber City, Gurgaon',
      address: 'Cyber City, Gurugram, Haryana 122002',
      coordinates: { lat: 28.4949, lng: 77.0869 },
      type: 'area'
    },
    {
      id: 5,
      name: 'Karol Bagh',
      address: 'Karol Bagh, New Delhi, Delhi 110005',
      coordinates: { lat: 28.6519, lng: 77.1909 },
      type: 'area'
    }
  ];

  const radiusOptions = [
    { value: 0.5, label: '500m' },
    { value: 1, label: '1km' },
    { value: 2, label: '2km' },
    { value: 5, label: '5km' },
    { value: 10, label: '10km' }
  ];

  const handleInputChange = (value) => {
    setSearchQuery(value);
    
    if (value?.length > 2) {
      const filtered = mockLocationSuggestions?.filter(location =>
        location?.name?.toLowerCase()?.includes(value?.toLowerCase()) ||
        location?.address?.toLowerCase()?.includes(value?.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleLocationSelect = (location) => {
    setSearchQuery(location?.name);
    setSuggestions([]);
    onLocationSearch?.(location);
  };

  const handleSearch = () => {
    if (searchQuery?.trim()) {
      setIsLoading(true);
      // Simulate geocoding API call
      setTimeout(() => {
        const mockResult = {
          name: searchQuery,
          coordinates: { lat: 28.6139 + Math.random() * 0.1, lng: 77.2090 + Math.random() * 0.1 },
          address: `${searchQuery}, New Delhi, India`
        };
        onLocationSearch?.(mockResult);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleRadiusSearch = () => {
    if (searchQuery?.trim()) {
      const location = {
        name: searchQuery,
        coordinates: { lat: 28.6139, lng: 77.2090 },
        address: `${searchQuery}, New Delhi, India`
      };
      onRadiusSearch?.(location, selectedRadius);
      setShowRadiusControls(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          const location = {
            name: 'Current Location',
            coordinates: {
              lat: position?.coords?.latitude,
              lng: position?.coords?.longitude
            },
            address: 'Your current location'
          };
          onLocationSearch?.(location);
          setSearchQuery('Current Location');
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter') {
      handleSearch();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-10 ${className}`}>
      <div className="bg-card border border-border rounded-lg shadow-modal p-3 min-w-96">
        {/* Search Input */}
        <div ref={searchRef} className="relative mb-3">
          <div className="relative">
            <Icon 
              name="Search" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e?.target?.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search locations, addresses, landmarks..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
            />
          </div>

          {/* Location Suggestions */}
          {suggestions?.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-modal z-50 max-h-60 overflow-y-auto">
              {suggestions?.map((suggestion) => (
                <button
                  key={suggestion?.id}
                  onClick={() => handleLocationSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-smooth border-b border-border last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <Icon 
                      name={suggestion?.type === 'landmark' ? 'MapPin' : 'Map'} 
                      size={16} 
                      className="text-primary mt-0.5" 
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-popover-foreground">{suggestion?.name}</p>
                      <p className="text-xs text-muted-foreground">{suggestion?.address}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleSearch}
            disabled={!searchQuery?.trim() || isLoading}
            loading={isLoading}
            iconName="Search"
            iconPosition="left"
            iconSize={14}
            className="flex-1"
          >
            Search
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRadiusControls(!showRadiusControls)}
            iconName="Circle"
            iconPosition="left"
            iconSize={14}
          >
            Radius
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLoading}
            iconName="Crosshair"
            iconSize={14}
            title="Get current location"
          />
        </div>

        {/* Radius Controls */}
        {showRadiusControls && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-card-foreground">
                Search Radius
              </label>
              <span className="text-sm text-muted-foreground">
                {radiusOptions?.find(r => r?.value === selectedRadius)?.label}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(parseFloat(e?.target?.value))}
                className="flex-1"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleRadiusSearch}
                disabled={!searchQuery?.trim()}
                iconName="Target"
                iconPosition="left"
                iconSize={14}
                className="flex-1"
              >
                Search Area
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRadiusControls(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSearchBar;