import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import MapContainer from './components/MapContainer';
import MapControls from './components/MapControls';
import MapSearchBar from './components/MapSearchBar';
import MapLegend from './components/MapLegend';
import IssueDetailsPanel from './components/IssueDetailsPanel';
import useCivicIssues from '../../hooks/useCivicIssues';
import * as routingService from '../../services/routingService';
import { Polyline } from 'react-leaflet';
import useGeofencing from '../../hooks/useGeofencing';
import { useAuth } from '../../contexts/AuthContext';

const InteractiveIssueMap = () => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [activeLayers, setActiveLayers] = useState([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [searchLocation, setSearchLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(null);
  const [plannedRoute, setPlannedRoute] = useState(null); // ORS GeoJSON
  const [routeStops, setRouteStops] = useState([]); // Array of issue IDs/objects
  const [routeStats, setRouteStats] = useState(null);
  
  // Use real data from the hook - fetch all public issues, not user-specific
  const { issues: realIssues, loading: isLoading } = useCivicIssues({});
  
  // Real-time geofencing for nearby alerts
  const { nearbyIssues } = useGeofencing(realIssues || [], 0.5); // 500m radius
  
  const { user } = useAuth();

  // Enhanced mock issues with coordinates for demonstration
  const enhancedMockIssues = [
    {
      id: 'mock-1',
      title: "Large pothole on Main Street causing traffic issues",
      description: "There's a significant pothole on Main Street near the market area that's causing traffic congestion and vehicle damage.",
      category: "roads",
      status: "pending",
      priority: "high",
      coordinates: { lat: 28.6139, lng: 77.2090 },
      address: "Main Street, Connaught Place, New Delhi, Delhi 110001",
      created_at: "2025-01-15T10:30:00Z"
    },
    {
      id: 'mock-2',
      title: "Overflowing garbage bin in residential area",
      description: "The community garbage bin has been overflowing for the past 3 days, creating unhygienic conditions.",
      category: "sanitation",
      status: "in_progress",
      priority: "medium",
      coordinates: { lat: 28.6200, lng: 77.2100 },
      address: "Sector 15, Rohini, New Delhi, Delhi 110085",
      created_at: "2025-01-14T14:20:00Z"
    },
    {
      id: 'mock-3',
      title: "Street light not working for over a week",
      description: "The street light on Park Avenue has been non-functional for more than a week.",
      category: "utilities",
      status: "resolved",
      priority: "medium",
      coordinates: { lat: 28.6080, lng: 77.2150 },
      address: "Park Avenue, Lajpat Nagar, New Delhi, Delhi 110024",
      created_at: "2025-01-10T19:45:00Z"
    },
    {
      id: 'mock-4',
      title: "Broken footpath creating pedestrian hazard",
      description: "The footpath near the bus stop has several broken tiles and uneven surfaces.",
      category: "roads",
      status: "pending",
      priority: "medium",
      coordinates: { lat: 28.6250, lng: 77.2050 },
      address: "Civil Lines, New Delhi, Delhi 110054",
      created_at: "2025-01-16T08:15:00Z"
    },
    {
      id: 'mock-5',
      title: "Water leakage from municipal pipeline",
      description: "There's a continuous water leak from the main pipeline causing water wastage.",
      category: "utilities",
      status: "in_progress",
      priority: "high",
      coordinates: { lat: 28.6180, lng: 77.2200 },
      address: "Karol Bagh, New Delhi, Delhi 110005",
      created_at: "2025-01-15T16:30:00Z"
    },
    {
      id: 'mock-6',
      title: "Illegal dumping in park area",
      description: "Construction waste and household garbage is being illegally dumped in the community park.",
      category: "environment",
      status: "pending",
      priority: "medium",
      coordinates: { lat: 28.6300, lng: 77.2120 },
      address: "Model Town, New Delhi, Delhi 110009",
      created_at: "2025-01-16T11:00:00Z"
    }
  ];

  // Filter issues that have valid coordinates (not null, undefined, or NaN)
  const issuesWithValidCoordinates = realIssues?.filter(issue => {
    const coords = issue?.coordinates;
    return coords &&
           coords.lat !== null && coords.lat !== undefined && !isNaN(coords.lat) &&
           coords.lng !== null && coords.lng !== undefined && !isNaN(coords.lng) &&
           coords.lat >= -90 && coords.lat <= 90 &&  // Valid latitude range
           coords.lng >= -180 && coords.lng <= 180;  // Valid longitude range
  }) || [];

  // Use real issues with valid coordinates, otherwise fall back to enhanced mock data
  const displayIssues = issuesWithValidCoordinates.length > 0 ? issuesWithValidCoordinates : (realIssues?.length > 0 ? [] : enhancedMockIssues);
  
  console.log('🗺️ Map Data Debug:', {
    realIssuesCount: realIssues?.length || 0,
    realIssuesWithValidCoords: issuesWithValidCoordinates.length,
    displayIssuesCount: displayIssues.length,
    usingMockData: issuesWithValidCoordinates.length === 0 && (!realIssues || realIssues.length === 0),
    sampleRealIssues: realIssues?.slice(0, 3)?.map(issue => ({
      id: issue?.id || issue?._id || 'unknown',
      title: (issue?.title || 'No Title')?.substring(0, 30) + '...',
      hasValidCoordinates: issuesWithValidCoordinates.some(valid => (valid.id || valid._id) === (issue?.id || issue?._id)),
      coordinates: issue?.coordinates,
      latitude: issue?.latitude,
      longitude: issue?.longitude
    })) || []
  });

  // Mock current user for header
  const currentUser = {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    role: "resident"
  };

  // Mock issues data
  const mockIssues = [
    {
      id: 1,
      title: "Large pothole on Main Street causing traffic issues",
      description: "There's a significant pothole on Main Street near the market area that's causing traffic congestion and vehicle damage. The hole is approximately 2 feet wide and 6 inches deep.",
      category: "roads",
      status: "pending",
      priority: "high",
      coordinates: { lat: 28.6139, lng: 77.2090 },
      address: "Main Street, Connaught Place, New Delhi, Delhi 110001",
      images: ["https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg"],
      reporter: {
        name: "Amit Sharma",
        id: 101
      },
      reportedAt: "2025-01-15T10:30:00Z",
      assignedTo: {
        name: "Roads Department Team A",
        department: "Public Works Department"
      },
      timeline: [
        {
          action: "Issue reported by citizen",
          timestamp: "2025-01-15T10:30:00Z"
        },
        {
          action: "Assigned to Roads Department",
          timestamp: "2025-01-15T11:15:00Z"
        }
      ],
      votes: {
        upvotes: 23,
        comments: 5
      }
    },
    {
      id: 2,
      title: "Overflowing garbage bin in residential area",
      description: "The community garbage bin has been overflowing for the past 3 days, creating unhygienic conditions and attracting stray animals.",
      category: "sanitation",
      status: "in-progress",
      priority: "medium",
      coordinates: { lat: 28.6200, lng: 77.2100 },
      address: "Sector 15, Rohini, New Delhi, Delhi 110085",
      images: ["https://images.pexels.com/photos/2827392/pexels-photo-2827392.jpeg"],
      reporter: {
        name: "Priya Singh",
        id: 102
      },
      reportedAt: "2025-01-14T14:20:00Z",
      assignedTo: {
        name: "Sanitation Team B",
        department: "Municipal Corporation"
      },
      timeline: [
        {
          action: "Issue reported",
          timestamp: "2025-01-14T14:20:00Z"
        },
        {
          action: "Team dispatched for inspection",
          timestamp: "2025-01-15T09:00:00Z"
        }
      ],
      votes: {
        upvotes: 15,
        comments: 3
      }
    },
    {
      id: 3,
      title: "Street light not working for over a week",
      description: "The street light on Park Avenue has been non-functional for more than a week, making the area unsafe during night hours.",
      category: "utilities",
      status: "resolved",
      priority: "medium",
      coordinates: { lat: 28.6080, lng: 77.2150 },
      address: "Park Avenue, Lajpat Nagar, New Delhi, Delhi 110024",
      images: ["https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg"],
      reporter: {
        name: "Vikram Gupta",
        id: 103
      },
      reportedAt: "2025-01-10T19:45:00Z",
      assignedTo: {
        name: "Electrical Maintenance Team",
        department: "Delhi Electricity Board"
      },
      timeline: [
        {
          action: "Issue reported",
          timestamp: "2025-01-10T19:45:00Z"
        },
        {
          action: "Repair work completed",
          timestamp: "2025-01-14T16:30:00Z"
        },
        {
          action: "Issue marked as resolved",
          timestamp: "2025-01-14T17:00:00Z"
        }
      ],
      votes: {
        upvotes: 8,
        comments: 2
      }
    },
    {
      id: 4,
      title: "Broken footpath creating pedestrian hazard",
      description: "The footpath near the bus stop has several broken tiles and uneven surfaces, making it dangerous for pedestrians, especially elderly people.",
      category: "roads",
      status: "pending",
      priority: "medium",
      coordinates: { lat: 28.6250, lng: 77.2050 },
      address: "Civil Lines, New Delhi, Delhi 110054",
      images: ["https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg"],
      reporter: {
        name: "Sunita Devi",
        id: 104
      },
      reportedAt: "2025-01-16T08:15:00Z",
      timeline: [
        {
          action: "Issue reported",
          timestamp: "2025-01-16T08:15:00Z"
        }
      ],
      votes: {
        upvotes: 12,
        comments: 4
      }
    },
    {
      id: 5,
      title: "Water leakage from municipal pipeline",
      description: "There\'s a continuous water leak from the main pipeline causing water wastage and making the road slippery.",
      category: "utilities",
      status: "in-progress",
      priority: "high",
      coordinates: { lat: 28.6180, lng: 77.2200 },
      address: "Karol Bagh, New Delhi, Delhi 110005",
      images: ["https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg"],
      reporter: {
        name: "Ramesh Chand",
        id: 105
      },
      reportedAt: "2025-01-15T16:30:00Z",
      assignedTo: {
        name: "Water Supply Team",
        department: "Delhi Jal Board"
      },
      timeline: [
        {
          action: "Issue reported",
          timestamp: "2025-01-15T16:30:00Z"
        },
        {
          action: "Emergency team dispatched",
          timestamp: "2025-01-15T17:00:00Z"
        }
      ],
      votes: {
        upvotes: 18,
        comments: 6
      }
    },
    {
      id: 6,
      title: "Illegal dumping in park area",
      description: "Construction waste and household garbage is being illegally dumped in the community park, affecting the environment and children's play area.",
      category: "environment",
      status: "pending",
      priority: "medium",
      coordinates: { lat: 28.6300, lng: 77.2120 },
      address: "Model Town, New Delhi, Delhi 110009",
      images: ["https://images.pexels.com/photos/2827392/pexels-photo-2827392.jpeg"],
      reporter: {
        name: "Neha Agarwal",
        id: 106
      },
      reportedAt: "2025-01-16T11:00:00Z",
      timeline: [
        {
          action: "Issue reported",
          timestamp: "2025-01-16T11:00:00Z"
        }
      ],
      votes: {
        upvotes: 25,
        comments: 8
      }
    }
  ];

  // Filter issues based on selected criteria
  useEffect(() => {
    let filtered = [...displayIssues];

    // Filter by categories
    if (selectedCategories?.length > 0) {
      filtered = filtered?.filter(issue => selectedCategories?.includes(issue?.category));
    }

    // Filter by status
    if (selectedStatuses?.length > 0) {
      filtered = filtered?.filter(issue => selectedStatuses?.includes(issue?.status));
    }

    // Filter by time range
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000
      };
      
      const timeLimit = timeRanges?.[selectedTimeRange];
      if (timeLimit) {
        filtered = filtered?.filter(issue => {
          const dateStr = issue.reportedAt || issue.created_at;
          if (!dateStr) return false;
          const issueDate = new Date(dateStr);
          if (isNaN(issueDate.getTime())) return false;
          return (now - issueDate) <= timeLimit;
        });
      }
    }

    // Filter by search radius
    if (searchLocation && searchRadius) {
      filtered = filtered?.filter(issue => {
        const distance = Math.sqrt(
          Math.pow(issue?.coordinates?.lat - searchLocation?.coordinates?.lat, 2) +
          Math.pow(issue?.coordinates?.lng - searchLocation?.coordinates?.lng, 2)
        ) * 111; // Rough conversion to km
        return distance <= searchRadius;
      });
    }

    setFilteredIssues(filtered);
  }, [selectedCategories, selectedStatuses, selectedTimeRange, searchLocation, searchRadius]);

  // Initialize with display issues (real or mock)
  useEffect(() => {
    setFilteredIssues(displayIssues);
  }, [realIssues, displayIssues.length]);

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
  };

  const handleLocationSearch = (location) => {
    setSearchLocation(location);
    setSearchRadius(null);
  };

  const handleRadiusSearch = (location, radius) => {
    setSearchLocation(location);
    setSearchRadius(radius);
  };

  const handleReportSimilar = (issue) => {
    // Navigate to issue reporting form with pre-filled data
    console.log('Report similar issue:', issue);
  };

  const handleDrawingModeToggle = () => {
    setIsDrawingMode(!isDrawingMode);
  };

  const handleAddToRoute = (issue) => {
    const newStops = [...routeStops, issue];
    setRouteStops(newStops);
  };

  const handleOptimizeRoute = async () => {
    if (routeStops.length < 2) return;
    
    try {
      const issueIds = routeStops.map(s => s.id || s._id);
      // Use the first stop as the starting point for optimization
      const startLocation = routeStops[0].coordinates;
      
      const optimizedData = await routingService.fetchOptimizedRoute(issueIds, startLocation);
      
      if (optimizedData && optimizedData.optimizedPath) {
        // Map the optimized IDs back to the issue objects in the correct order
        const optimizedStops = optimizedData.optimizedPath.map(wp => 
          routeStops.find(s => (s.id || s._id) === wp.id)
        ).filter(Boolean);
        
        setRouteStops(optimizedStops);
        // Stats will be updated by the RoutingMachine component automatically or we can set them if needed
      }
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  const handleClearRoute = () => {
    setRouteStops([]);
    setPlannedRoute(null);
    setRouteStats(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentUser={user} notificationCount={3} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading interactive map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} notificationCount={3} />
      <main className="relative">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb />
        </div>

        {/* Map Interface */}
        <div className="relative h-[calc(100vh-120px)]">
          {/* Map Container */}
           <MapContainer
            issues={filteredIssues.length > 0 ? filteredIssues : (realIssues || enhancedMockIssues)}
            selectedIssue={selectedIssue}
            onIssueSelect={handleIssueSelect}
            onMapClick={() => {}}
            searchLocation={searchLocation}
            searchRadius={searchRadius}
            activeLayers={activeLayers}
            isDrawingMode={isDrawingMode}
            routeStops={routeStops}
          />

          {/* Map Search Bar */}
          <MapSearchBar
            onLocationSearch={handleLocationSearch}
            onRadiusSearch={handleRadiusSearch}
          />

          {/* Map Controls */}
          <MapControls
            onCategoryFilter={setSelectedCategories}
            onStatusFilter={setSelectedStatuses}
            onTimeRangeFilter={setSelectedTimeRange}
            onLayerToggle={setActiveLayers}
            onDrawingModeToggle={handleDrawingModeToggle}
            selectedCategories={selectedCategories}
            selectedStatuses={selectedStatuses}
            selectedTimeRange={selectedTimeRange}
            activeLayers={activeLayers}
            isDrawingMode={isDrawingMode}
          />

          {/* Map Legend */}
          <MapLegend />

          {/* Issue Details Panel */}
          {selectedIssue && (
            <IssueDetailsPanel
              issue={selectedIssue}
              onClose={() => setSelectedIssue(null)}
              onReportSimilar={handleReportSimilar}
              onAddToRoute={handleAddToRoute}
              isInRoute={routeStops.some(s => s.id === selectedIssue.id)}
            />
          )}

          {/* Route Planner Overlay */}
          {routeStops.length > 0 && (
            <div className="absolute top-20 left-4 z-30 bg-white/95 backdrop-blur p-4 rounded-xl shadow-xl border border-blue-100 min-w-64 max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Icon name="Navigation" className="text-blue-600" size={16} />
                  Inspection Route
                </h4>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleOptimizeRoute} 
                    className="text-blue-600 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 transition-colors"
                    title="Optimize Route"
                  >
                    <Icon name="Wand2" size={14} />
                  </button>
                  <button onClick={handleClearRoute} className="text-gray-400 hover:text-red-500">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                {routeStops.map((stop, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-semibold text-gray-800 truncate">{stop.title}</p>
                      <p className="text-[10px] text-gray-500 truncate">{stop.address}</p>
                    </div>
                  </div>
                ))}
              </div>

              {routeStats && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Dist</p>
                      <p className="text-sm font-bold text-gray-800">{routeStats.distanceKm}km</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Est</p>
                      <p className="text-sm font-bold text-gray-800">{routeStats.durationMin}m</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 shadow-sm">
                    Navigate
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions Floating Button */}
          <div className="absolute bottom-4 right-4 z-30">
            <div className="flex flex-col space-y-2">
              <Link to="/issue-reporting-form">
                <Button
                  variant="default"
                  size="lg"
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={20}
                  className="shadow-lg"
                >
                  Report Issue
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location?.reload()}
                className="bg-card shadow-lg"
                title="Refresh Map"
              >
                <Icon name="RefreshCw" size={20} />
              </Button>
            </div>
          </div>

          {/* Mobile Bottom Sheet Trigger */}
          <div className="lg:hidden absolute bottom-20 left-4 right-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                // Toggle mobile filters panel
                console.log('Toggle mobile filters');
              }}
              iconName="Filter"
              iconPosition="left"
              iconSize={16}
              className="bg-card shadow-lg"
            >
              Filters & Search ({filteredIssues?.length} issues)
            </Button>
          </div>

          {/* No Issues Found State */}
          {filteredIssues?.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-40">
              <div className="text-center max-w-md mx-auto p-8">
                <Icon name="MapPin" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Issues Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  No issues match your current filters or search criteria. Try adjusting your filters or search in a different area.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedStatuses([]);
                      setSelectedTimeRange('all');
                      setSearchLocation(null);
                      setSearchRadius(null);
                    }}
                    iconName="RotateCcw"
                    iconPosition="left"
                    iconSize={16}
                  >
                    Clear Filters
                  </Button>
                  <Link to="/issue-reporting-form">
                    <Button
                      variant="default"
                      iconName="Plus"
                      iconPosition="left"
                      iconSize={16}
                    >
                      Report New Issue
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InteractiveIssueMap;