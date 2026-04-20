import apiClient from '../lib/apiClient';

export const landingService = {
  /**
   * Get KPIs with fallback strategy (Hybrid: Live + Mock)
   */
  async getKPIs(options = {}) {
    const { useLiveData = true } = options;

    try {
      if (useLiveData) {
        const response = await apiClient.get('/public/stats');
        if (response.data.success) {
          return { ...response.data.data, source: 'live' };
        }
      }
      return { ...this.getMockKPIs(), source: 'mock' };
    } catch (error) {
      console.warn('Live KPIs unavailable, using mocks:', error);
      return { ...this.getMockKPIs(), source: 'fallback' };
    }
  },

  /**
   * High-quality mock data (realistic values)
   */
  getMockKPIs() {
    return {
      totalIssues: 12847,
      resolvedIssues: 9234,
      resolutionRate: 72,
      avgResponseTime: 18,
      activeCitizens: 10534,
      reportsThisWeek: 487,
      timestamp: new Date(),
      trends: {
        totalIssues: [12200, 12400, 12600, 12847],
        resolutionRate: [68, 69, 71, 72],
        avgResponseTime: [24, 22, 20, 18]
      }
    };
  }
};

export default landingService;
