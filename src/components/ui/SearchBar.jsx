import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Input from './Input';
import Button from './Button';

const SearchBar = ({ 
  onSearch, 
  onLocationSearch, 
  placeholder = "Search issues, locations, or keywords...",
  showLocationSearch = true,
  className = "",
  size = "default"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const locationRef = useRef(null);

  const mockSuggestions = [
    { id: 1, text: 'Pothole on Main Street', type: 'issue', location: 'Downtown' },
    { id: 2, text: 'Broken streetlight', type: 'issue', location: 'Park Avenue' },
    { id: 3, text: 'Garbage collection delay', type: 'issue', location: 'Residential Area' },
    { id: 4, text: 'Water leak', type: 'issue', location: 'Commercial District' },
    { id: 5, text: 'Downtown', type: 'location', coordinates: [40.7128, -74.0060] },
    { id: 6, text: 'Park Avenue', type: 'location', coordinates: [40.7589, -73.9441] },
    { id: 7, text: 'Commercial District', type: 'location', coordinates: [40.7505, -73.9934] }
  ];

  const handleSearch = (query = searchQuery) => {
    if (query?.trim()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        onSearch?.(query?.trim());
        setIsLoading(false);
        setSuggestions([]);
      }, 300);
    }
  };

  const handleLocationSearch = (location = locationQuery) => {
    if (location?.trim()) {
      onLocationSearch?.(location?.trim());
      setIsLocationSearchOpen(false);
      setLocationQuery('');
    }
  };

  const handleInputChange = (value) => {
    setSearchQuery(value);
    
    if (value?.length > 2) {
      const filtered = mockSuggestions?.filter(item =>
        item?.text?.toLowerCase()?.includes(value?.toLowerCase())
      );
      setSuggestions(filtered?.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion?.type === 'location') {
      handleLocationSearch(suggestion?.text);
    } else {
      setSearchQuery(suggestion?.text);
      handleSearch(suggestion?.text);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLocationKeyPress = (e) => {
    if (e?.key === 'Enter') {
      handleLocationSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    searchRef?.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setSuggestions([]);
      }
      if (locationRef?.current && !locationRef?.current?.contains(event?.target)) {
        setIsLocationSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'h-8',
    default: 'h-10',
    lg: 'h-12'
  };

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Main Search Input */}
        <div ref={searchRef} className="relative flex-1">
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
              placeholder={placeholder}
              className={`w-full pl-10 pr-10 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth ${sizeClasses?.[size]}`}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              >
                <Icon name="X" size={14} />
              </Button>
            )}
          </div>

          {/* Search Suggestions */}
          {suggestions?.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-modal z-50 max-h-60 overflow-y-auto">
              {suggestions?.map((suggestion) => (
                <button
                  key={suggestion?.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-smooth border-b border-border last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <Icon 
                      name={suggestion?.type === 'location' ? 'MapPin' : 'AlertCircle'} 
                      size={16} 
                      className={suggestion?.type === 'location' ? 'text-primary' : 'text-accent'}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-popover-foreground">{suggestion?.text}</p>
                      {suggestion?.location && (
                        <p className="text-xs text-muted-foreground">{suggestion?.location}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      suggestion?.type === 'location' ?'bg-primary/10 text-primary' :'bg-accent/10 text-accent'
                    }`}>
                      {suggestion?.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button
          onClick={() => handleSearch()}
          disabled={!searchQuery?.trim() || isLoading}
          loading={isLoading}
          iconName="Search"
          iconPosition="left"
          iconSize={16}
          className="shrink-0"
        >
          Search
        </Button>

        {/* Location Search Toggle */}
        {showLocationSearch && (
          <div ref={locationRef} className="relative">
            <Button
              variant="outline"
              onClick={() => setIsLocationSearchOpen(!isLocationSearchOpen)}
              iconName="MapPin"
              iconPosition="left"
              iconSize={16}
              className="shrink-0"
            >
              Location
            </Button>

            {/* Location Search Dropdown */}
            {isLocationSearchOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-popover border border-border rounded-md shadow-modal z-50 p-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-popover-foreground">Search by Location</h4>
                  <div className="relative">
                    <Icon 
                      name="MapPin" 
                      size={16} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                    />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e?.target?.value)}
                      onKeyPress={handleLocationKeyPress}
                      placeholder="Enter location..."
                      className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleLocationSearch()}
                      disabled={!locationQuery?.trim()}
                      className="flex-1"
                    >
                      Search
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Get current location logic would go here
                        console.log('Get current location');
                      }}
                      iconName="Crosshair"
                      iconSize={14}
                    >
                      Current
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;