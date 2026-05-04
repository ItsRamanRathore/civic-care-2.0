import apiClient from '../lib/apiClient';

export const analyticsService = {
  // Get analytics data from the new backend (Enriched for Phase 3)
  async getAnalyticsData(dateRange = null) {
    try {
      console.log('📊 Fetching enhanced analytics data from MongoDB backend...');
      const response = await apiClient.get('/issues/stats/analytics', { params: dateRange });
      const { timeline = [], performance = [], geographic = [], distribution = {}, leaderboard = [] } = response.data.data;

      // Extract metrics for the top cards
      const total = timeline.length > 0 ? timeline.reduce((sum, d) => sum + (d.reported || 0), 0) : 0;
      const resolved = timeline.length > 0 ? timeline.reduce((sum, d) => sum + (d.resolved || 0), 0) : 0;
      const avgPerf = performance.length > 0 
        ? (performance.reduce((sum, p) => sum + (p.avgResolutionTime || 0), 0) / performance.length).toFixed(1)
        : '0';

      return {
        metrics: [
          { title: "Total Reports", value: total.toLocaleString(), icon: "AlertCircle", change: "+0%", changeType: "neutral", description: "Across selected period" },
          { title: "Resolved", value: resolved.toLocaleString(), icon: "CheckCircle", change: "+0%", changeType: "neutral", description: "Successfully closed" },
          { title: "Avg. Resolution", value: `${avgPerf}h`, icon: "Clock", change: "0%", changeType: "neutral", description: "Time to fix" },
          { title: "Hotspots", value: geographic.length.toString(), icon: "Map", change: "Stable", changeType: "neutral", description: "Active clusters" }
        ],
        categories: (distribution?.byCategory || []).map(c => ({
          name: (c._id || 'Other').charAt(0).toUpperCase() + (c._id || 'other').slice(1),
          value: c.count || 0,
          full: 100
        })),
        timeline: timeline.map(t => ({
          name: t._id,
          reported: t.reported || 0,
          resolved: t.resolved || 0
        })),
        departments: (distribution?.byCategory || []).map(cat => {
          const catName = cat._id || 'Default';
          const perf = performance.find(p => p._id === catName);
          const total = cat.count || 0;
          const resolved = perf ? (perf.count || 0) : 0;
          const avgRes = perf ? (perf.avgResolutionTime || 0) : 0;
          
          return {
            name: catName.charAt(0).toUpperCase() + catName.slice(1),
            total,
            resolved,
            avgResolutionTime: Number(avgRes.toFixed(1)),
            efficiency: Math.max(0, Math.round(100 - avgRes))
          };
        }),
        geographic: geographic.map(g => ({
          id: `${g._id.lat}-${g._id.lng}`,
          lat: g.center?.lat || 0,
          lng: g.center?.lng || 0,
          intensity: g.count || 0
        })),
        recentIssues: (leaderboard || []).map(u => ({
          ...u,
          name: u.name || 'Anonymous'
        })),
        lastUpdated: new Date().toISOString(),
        error: null
      };
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
      return { error: error.message };
    }
  },

  // Fetch AI-detected anomalies
  async getAnomalies() {
    try {
      const response = await apiClient.get('/analytics/anomalies');
      return { data: response.data.data.anomalies, error: null };
    } catch (error) {
      return { data: [], error: error.message };
    }
  },

  // Fetch predictive forecasts
  async getForecast(category = null) {
    try {
      const response = await apiClient.get('/analytics/forecast', { params: { category } });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Trigger professional report download
  async exportReport(type = 'pdf', data) {
    try {
      console.log(`📄 Triggering professional ${type} export...`);
      // In a real implementation, this would hit /api/analytics/export
      // For now, we perform a mock browser trigger or standard API call
      return { success: true, message: `${type.toUpperCase()} report generated.` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get civic issues for a specific user
  async getRecentIssues(limit = 10) {
    try {
      const response = await apiClient.get('/issues', { params: { limit } });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: [], error: error.message };
    }
  },

  // Real-time updates subscription
  subscribeToAnalyticsChanges(callback) {
    try {
      // Use dynamic import for ESM/Vite compatibility
      import('socket.io-client').then(({ io }) => {
        const socket = io(window.location.protocol + '//' + window.location.hostname + ':5000');
        socket.on('analyticsChange', (payload) => {
          callback(payload);
        });
        return socket;
      }).catch(err => {
        console.error('Socket.io load failed for analytics:', err);
      });
    } catch (e) {
      console.error('Socket subscribe error for analytics:', e);
    }
  },

  unsubscribeFromChanges(socket) {
    if (socket && typeof socket.disconnect === 'function') {
      socket.disconnect();
    }
  }
};

export default analyticsService;