import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import MetricsCard from './components/MetricsCard';
import ChartContainer from './components/ChartContainer';
import IssuesByCategoryChart from './components/IssuesByCategoryChart';
import ResolutionTimelineChart from './components/ResolutionTimelineChart';
import DepartmentPerformanceChart from './components/DepartmentPerformanceChart';
import GeographicHeatMap from './components/GeographicHeatMap';
import DataTable from './components/DataTable';
import DateRangeSelector from './components/DateRangeSelector';
import analyticsService from '../../services/analyticsService';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    range: '30d'
  });
  const [chartType, setChartType] = useState('line');
  const [refreshTimestamp, setRefreshTimestamp] = useState(new Date().toLocaleString());
  
  // Real-time data state
  const [analyticsData, setAnalyticsData] = useState({
    metrics: [],
    categories: [],
    timeline: [],
    departments: [],
    geographic: [],
    recentIssues: [],
    lastUpdated: null,
    error: null
  });

  // Real-time subscription ref
  const subscriptionRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Mock current user for header
  const currentUser = {
    name: "Admin User",
    email: "admin@civicare.gov.in"
  };

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching analytics data...');
      
      const data = await analyticsService.getAnalyticsData(dateRange);
      
      if (data.error) {
        console.error('❌ Analytics data error:', data.error);
        setAnalyticsData(prev => ({ ...prev, error: data.error }));
      } else {
        console.log('✅ Analytics data loaded successfully');
        setAnalyticsData(data);
        setRefreshTimestamp(new Date(data.lastUpdated).toLocaleString());
      }
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
      setAnalyticsData(prev => ({ ...prev, error: error.message }));
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Handle manual refresh
  const handleRefreshData = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Handle real-time data updates
  const handleRealTimeUpdate = useCallback((payload) => {
    console.log('🔄 Real-time update received:', payload.eventType);
    
    // Debounce updates to avoid too frequent refreshes
    if (refreshIntervalRef.current) {
      clearTimeout(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setTimeout(() => {
      fetchAnalyticsData();
    }, 2000); // Wait 2 seconds before refreshing
  }, [fetchAnalyticsData]);

  // Setup real-time subscription
  const setupRealTimeSubscription = useCallback(() => {
    if (!realTimeEnabled) return;
    
    console.log('🔄 Setting up real-time analytics subscription...');
    subscriptionRef.current = analyticsService.subscribeToAnalyticsChanges(handleRealTimeUpdate);
  }, [realTimeEnabled, handleRealTimeUpdate]);

  // Cleanup real-time subscription
  const cleanupRealTimeSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('🔄 Cleaning up real-time subscription...');
      analyticsService.unsubscribeFromChanges(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    if (refreshIntervalRef.current) {
      clearTimeout(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Toggle real-time updates
  const toggleRealTime = useCallback(() => {
    setRealTimeEnabled(prev => {
      const newState = !prev;
      if (newState) {
        setupRealTimeSubscription();
      } else {
        cleanupRealTimeSubscription();
      }
      return newState;
    });
  }, [setupRealTimeSubscription, cleanupRealTimeSubscription]);

  const handleExportChart = (chartName) => {
    console.log(`Exporting ${chartName} chart...`);
    // Export logic would be implemented here
  };

  const handleExportData = () => {
    console.log('Exporting analytics data to CSV...');
    // CSV export logic would be implemented here
  };

  const handleDateRangeChange = useCallback((newRange) => {
    setDateRange(newRange);
    console.log('📅 Date range changed:', newRange);
  }, []);

  // Effects
  useEffect(() => {
    // Initial data load
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    // Setup real-time subscription
    setupRealTimeSubscription();
    
    // Cleanup on unmount
    return cleanupRealTimeSubscription;
  }, [setupRealTimeSubscription, cleanupRealTimeSubscription]);

  // Auto-refresh every 5 minutes when real-time is disabled
  useEffect(() => {
    if (!realTimeEnabled) {
      const interval = setInterval(fetchAnalyticsData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled, fetchAnalyticsData]);

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} notificationCount={5} />
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb />
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Analytics Dashboard
              {realTimeEnabled && (
                <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Live
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into civic issue patterns and resolution performance
            </p>
            {analyticsData.error && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ {analyticsData.error}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
            <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
            
            <div className="flex space-x-2">
              <Button
                variant={realTimeEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleRealTime}
                iconName={realTimeEnabled ? "Zap" : "ZapOff"}
                iconPosition="left"
                iconSize={16}
              >
                {realTimeEnabled ? "Live" : "Manual"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                loading={loading}
                iconName="RefreshCw"
                iconPosition="left"
                iconSize={16}
              >
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                iconName="Download"
                iconPosition="left"
                iconSize={16}
              >
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsData.metrics?.map((metric, index) => (
            <MetricsCard
              key={index}
              title={metric?.title}
              value={metric?.value}
              change={metric?.change}
              changeType={metric?.changeType}
              icon={metric?.icon}
              description={metric?.description}
              loading={loading}
            />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Issues by Category */}
          <ChartContainer
            title="Issues by Category"
            onExport={() => handleExportChart('category')}
            onRefresh={handleRefreshData}
            loading={loading}
            lastUpdated={refreshTimestamp}
            controls={
              realTimeEnabled && (
                <div className="flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Real-time
                </div>
              )
            }
          >
            <IssuesByCategoryChart loading={loading} data={analyticsData.categories} />
          </ChartContainer>

          {/* Resolution Timeline */}
          <ChartContainer
            title="Resolution Timeline"
            onExport={() => handleExportChart('timeline')}
            onRefresh={handleRefreshData}
            loading={loading}
            lastUpdated={refreshTimestamp}
            controls={
              <div className="flex items-center space-x-2">
                {realTimeEnabled && (
                  <div className="flex items-center text-xs text-green-600 mr-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    Real-time
                  </div>
                )}
                <Button
                  variant={chartType === 'line' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  Line
                </Button>
                <Button
                  variant={chartType === 'area' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('area')}
                >
                  Area
                </Button>
              </div>
            }
          >
            <ResolutionTimelineChart chartType={chartType} loading={loading} data={analyticsData.timeline} />
          </ChartContainer>
        </div>

        {/* Department Performance & Geographic Heat Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartContainer
            title="Department Performance"
            onExport={() => handleExportChart('department')}
            onRefresh={handleRefreshData}
            loading={loading}
            lastUpdated={refreshTimestamp}
            controls={
              realTimeEnabled && (
                <div className="flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Real-time
                </div>
              )
            }
          >
            <DepartmentPerformanceChart loading={loading} data={analyticsData.departments} />
          </ChartContainer>

          <ChartContainer
            title="Geographic Heat Map"
            onExport={() => handleExportChart('geographic')}
            onRefresh={handleRefreshData}
            loading={loading}
            lastUpdated={refreshTimestamp}
            controls={
              realTimeEnabled && (
                <div className="flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Real-time
                </div>
              )
            }
          >
            <GeographicHeatMap loading={loading} data={analyticsData.geographic} />
          </ChartContainer>
        </div>

        {/* Detailed Data Table */}
        <div className="mb-8">
          <DataTable
            loading={loading}
            onExport={handleExportData}
            data={analyticsData.recentIssues}
            realTime={realTimeEnabled}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin-dashboard">
              <Button
                variant="outline"
                className="w-full justify-start"
                iconName="BarChart3"
                iconPosition="left"
                iconSize={16}
              >
                Admin Dashboard
              </Button>
            </Link>
            
            <Link to="/public-reports-listing">
              <Button
                variant="outline"
                className="w-full justify-start"
                iconName="List"
                iconPosition="left"
                iconSize={16}
              >
                View All Issues
              </Button>
            </Link>
            
            <Link to="/interactive-issue-map">
              <Button
                variant="outline"
                className="w-full justify-start"
                iconName="Map"
                iconPosition="left"
                iconSize={16}
              >
                Issue Map
              </Button>
            </Link>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              iconName="FileText"
              iconPosition="left"
              iconSize={16}
              onClick={() => console.log('Generate detailed report')}
            >
              Generate Report
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {realTimeEnabled ? (
              <>
                <span className="inline-flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Real-time updates enabled
                </span>
                {analyticsData.lastUpdated && (
                  <> • Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}</>
                )}
              </>
            ) : (
              <>Auto-refresh every 5 minutes • Last refresh: {refreshTimestamp}</>
            )}
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} Civicare Analytics Dashboard. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;