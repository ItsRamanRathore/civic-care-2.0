import apiClient from '../lib/apiClient';

/**
 * Get an optimized route between multiple points using the backend intelligence layer.
 * @param {Array<string>} issueIds - Array of issue IDs to optimize.
 * @param {Object} startLocation - Optional {lat, lng} for the starting point.
 * @returns {Promise<Object>} - The optimized path waypoints.
 */
export const fetchOptimizedRoute = async (issueIds, startLocation = null) => {
  if (!issueIds || issueIds.length === 0) return null;

  try {
    const response = await apiClient.post('/analytics/optimize-route', {
      issueIds,
      startLocation
    });

    return response.data.data;
  } catch (error) {
    console.error('❌ Route Optimization Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch a standard route geometry for a set of coordinates (legacy fallback or visualization).
 */
export const fetchRouteGeometry = async (coordinates) => {
  if (coordinates.length < 2) return null;

  try {
    // This could still use ORS or another service if needed, 
    // but for LRM, we'll let the plugin handle it.
    return { coordinates };
  } catch (error) {
    console.error('❌ Routing Error:', error.message);
    throw error;
  }
};

/**
 * Get the time and distance between multiple stops.
 */
export const getRouteStats = (routeData) => {
  if (!routeData || !routeData.summary) return null;
  return {
    distanceKm: (routeData.summary.totalDistance / 1000).toFixed(2),
    durationMin: (routeData.summary.totalTime / 60).toFixed(0)
  };
};

