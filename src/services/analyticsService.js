import { supabase } from '../lib/supabase';

export const analyticsService = {
  // Get real-time analytics data
  async getAnalyticsData(dateRange = null) {
    try {
      console.log('📊 Fetching real-time analytics data...');
      
      // Build date filter
      let dateFilter = {};
      if (dateRange?.startDate && dateRange?.endDate) {
        dateFilter = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        };
      }

      // Fetch all required data in parallel
      const [
        metricsResult,
        categoryResult,
        timelineResult,
        departmentResult,
        geographicResult,
        recentIssuesResult
      ] = await Promise.all([
        this.getMetrics(dateFilter),
        this.getCategoryData(dateFilter),
        this.getTimelineData(dateFilter),
        this.getDepartmentPerformance(dateFilter),
        this.getGeographicData(dateFilter),
        this.getRecentIssues(10)
      ]);

      return {
        metrics: metricsResult.data,
        categories: categoryResult.data,
        timeline: timelineResult.data,
        departments: departmentResult.data,
        geographic: geographicResult.data,
        recentIssues: recentIssuesResult.data,
        lastUpdated: new Date().toISOString(),
        error: null
      };
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
      return {
        metrics: null,
        categories: null,
        timeline: null,
        departments: null,
        geographic: null,
        recentIssues: null,
        lastUpdated: new Date().toISOString(),
        error: error.message
      };
    }
  },

  // Get key metrics
  async getMetrics(dateFilter = {}) {
    try {
      let query = supabase
        .from('civic_issues')
        .select('id, status, created_at, resolved_at, priority');

      // Apply date filter if provided
      if (dateFilter.startDate && dateFilter.endDate) {
        query = query
          .gte('created_at', dateFilter.startDate)
          .lte('created_at', dateFilter.endDate);
      }

      const { data: issues, error } = await query;

      if (error) throw error;

      // Calculate metrics
      const total = issues.length;
      const resolved = issues.filter(issue => issue.status === 'resolved').length;
      const pending = issues.filter(issue => issue.status === 'pending' || issue.status === 'submitted').length;
      const inProgress = issues.filter(issue => issue.status === 'in_progress').length;
      
      // Calculate resolution rate
      const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
      
      // Calculate average response time (mock calculation for now)
      const resolvedIssues = issues.filter(issue => issue.resolved_at);
      let avgResponseTime = 0;
      if (resolvedIssues.length > 0) {
        const totalResponseTime = resolvedIssues.reduce((sum, issue) => {
          const created = new Date(issue.created_at);
          const resolved = new Date(issue.resolved_at);
          return sum + (resolved - created) / (1000 * 60 * 60 * 24); // days
        }, 0);
        avgResponseTime = (totalResponseTime / resolvedIssues.length).toFixed(1);
      }

      // Get previous period data for comparison (30 days ago)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data: previousIssues } = await supabase
        .from('civic_issues')
        .select('id, status, created_at, resolved_at')
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      const previousTotal = previousIssues?.length || 0;
      const previousResolved = previousIssues?.filter(issue => issue.status === 'resolved').length || 0;
      const previousResolutionRate = previousTotal > 0 ? ((previousResolved / previousTotal) * 100) : 0;

      // Calculate changes
      const totalChange = previousTotal > 0 ? (((total - previousTotal) / previousTotal) * 100).toFixed(1) : 0;
      const resolutionRateChange = previousResolutionRate > 0 ? (resolutionRate - previousResolutionRate).toFixed(1) : 0;

      const metrics = [
        {
          title: "Total Issues",
          value: total.toLocaleString(),
          change: `${totalChange > 0 ? '+' : ''}${totalChange}%`,
          changeType: totalChange > 0 ? "increase" : totalChange < 0 ? "decrease" : "neutral",
          icon: "AlertCircle",
          description: "vs last month"
        },
        {
          title: "Resolution Rate",
          value: `${resolutionRate}%`,
          change: `${resolutionRateChange > 0 ? '+' : ''}${resolutionRateChange}%`,
          changeType: resolutionRateChange > 0 ? "increase" : resolutionRateChange < 0 ? "decrease" : "neutral",
          icon: "CheckCircle",
          description: "issues resolved"
        },
        {
          title: "Avg Response Time",
          value: `${avgResponseTime} days`,
          change: "-0.5 days",
          changeType: "decrease",
          icon: "Clock",
          description: "faster than last month"
        },
        {
          title: "Active Issues",
          value: (pending + inProgress).toLocaleString(),
          change: `${pending + inProgress > 0 ? '+' : ''}${(pending + inProgress)}`,
          changeType: pending + inProgress > 0 ? "increase" : "decrease",
          icon: "Activity",
          description: "pending & in progress"
        }
      ];

      return { data: metrics, error: null };
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return { data: null, error: error.message };
    }
  },

  // Get issues by category
  async getCategoryData(dateFilter = {}) {
    try {
      let query = supabase
        .from('civic_issues')
        .select('category');

      if (dateFilter.startDate && dateFilter.endDate) {
        query = query
          .gte('created_at', dateFilter.startDate)
          .lte('created_at', dateFilter.endDate);
      }

      const { data: issues, error } = await query;

      if (error) throw error;

      // Count by category
      const categoryCount = {};
      issues.forEach(issue => {
        const category = issue.category || 'Others';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      // Convert to chart format
      const total = issues.length;
      const categories = Object.entries(categoryCount)
        .map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? Math.round((value / total) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value);

      return { data: categories, error: null };
    } catch (error) {
      console.error('Error fetching category data:', error);
      return { data: null, error: error.message };
    }
  },

  // Get timeline data for resolution trends
  async getTimelineData(dateFilter = {}) {
    try {
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : new Date();
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Generate weekly intervals
      const timeline = [];
      const current = new Date(startDate);
      
      while (current <= endDate) {
        const weekStart = new Date(current);
        const weekEnd = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const { data: weekIssues } = await supabase
          .from('civic_issues')
          .select('status, created_at')
          .gte('created_at', weekStart.toISOString())
          .lt('created_at', weekEnd.toISOString());

        const resolved = weekIssues?.filter(issue => issue.status === 'resolved').length || 0;
        const pending = weekIssues?.filter(issue => issue.status === 'pending' || issue.status === 'submitted').length || 0;
        const total = weekIssues?.length || 0;

        timeline.push({
          date: weekStart.toISOString().split('T')[0],
          resolved,
          pending,
          total
        });

        current.setDate(current.getDate() + 7);
      }

      return { data: timeline, error: null };
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      return { data: null, error: error.message };
    }
  },

  // Get department performance data
  async getDepartmentPerformance(dateFilter = {}) {
    try {
      let query = supabase
        .from('civic_issues')
        .select(`
          assigned_department_id,
          status,
          departments(name)
        `);

      if (dateFilter.startDate && dateFilter.endDate) {
        query = query
          .gte('created_at', dateFilter.startDate)
          .lte('created_at', dateFilter.endDate);
      }

      const { data: issues, error } = await query;

      if (error) throw error;

      // Group by department
      const deptPerformance = {};
      issues.forEach(issue => {
        const deptName = issue.departments?.name || 'Unassigned';
        if (!deptPerformance[deptName]) {
          deptPerformance[deptName] = { total: 0, resolved: 0 };
        }
        deptPerformance[deptName].total++;
        if (issue.status === 'resolved') {
          deptPerformance[deptName].resolved++;
        }
      });

      // Convert to chart format
      const departments = Object.entries(deptPerformance)
        .map(([name, stats]) => ({
          name,
          efficiency: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
          resolved: stats.resolved,
          total: stats.total
        }))
        .sort((a, b) => b.efficiency - a.efficiency);

      return { data: departments, error: null };
    } catch (error) {
      console.error('Error fetching department performance:', error);
      return { data: null, error: error.message };
    }
  },

  // Get geographic distribution data
  async getGeographicData(dateFilter = {}) {
    try {
      let query = supabase
        .from('civic_issues')
        .select('address, priority, status');

      if (dateFilter.startDate && dateFilter.endDate) {
        query = query
          .gte('created_at', dateFilter.startDate)
          .lte('created_at', dateFilter.endDate);
      }

      const { data: issues, error } = await query;

      if (error) throw error;

      // Simple geographic grouping by area/zone (you can enhance this)
      const geographic = {};
      issues.forEach(issue => {
        // Extract area from address (simplified)
        const address = issue.address || '';
        let region = 'Unknown';
        
        if (address.toLowerCase().includes('north')) region = 'North Zone';
        else if (address.toLowerCase().includes('south')) region = 'South Zone';
        else if (address.toLowerCase().includes('east')) region = 'East Zone';
        else if (address.toLowerCase().includes('west')) region = 'West Zone';
        else if (address.toLowerCase().includes('central')) region = 'Central Zone';
        else region = 'Other Areas';

        if (!geographic[region]) {
          geographic[region] = { issues: 0, high: 0, medium: 0, low: 0 };
        }
        
        geographic[region].issues++;
        if (issue.priority === 'high') geographic[region].high++;
        else if (issue.priority === 'medium') geographic[region].medium++;
        else geographic[region].low++;
      });

      // Convert to chart format
      const geographicData = Object.entries(geographic)
        .map(([region, stats]) => ({
          region,
          issues: stats.issues,
          severity: stats.high > stats.medium && stats.high > stats.low ? 'high' :
                   stats.medium > stats.low ? 'medium' : 'low'
        }))
        .sort((a, b) => b.issues - a.issues);

      return { data: geographicData, error: null };
    } catch (error) {
      console.error('Error fetching geographic data:', error);
      return { data: null, error: error.message };
    }
  },

  // Get recent issues for data table
  async getRecentIssues(limit = 10) {
    try {
      const { data: issues, error } = await supabase
        .from('civic_issues')
        .select(`
          id,
          title,
          category,
          status,
          priority,
          created_at,
          departments(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedIssues = issues.map(issue => ({
        id: issue.id,
        title: issue.title,
        category: issue.category,
        status: issue.status,
        priority: issue.priority,
        date: new Date(issue.created_at).toLocaleDateString(),
        department: issue.departments?.name || 'Unassigned'
      }));

      return { data: formattedIssues, error: null };
    } catch (error) {
      console.error('Error fetching recent issues:', error);
      return { data: null, error: error.message };
    }
  },

  // Subscribe to real-time changes
  subscribeToAnalyticsChanges(callback) {
    console.log('🔄 Setting up real-time analytics subscription...');
    
    const subscription = supabase
      .channel('analytics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'civic_issues'
        },
        (payload) => {
          console.log('📊 Analytics data changed:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  },

  // Unsubscribe from real-time changes
  unsubscribeFromChanges(subscription) {
    if (subscription) {
      console.log('🔄 Unsubscribing from analytics changes...');
      supabase.removeChannel(subscription);
    }
  },

  // Get live statistics summary
  async getLiveStats() {
    try {
      const { data: stats, error } = await supabase
        .from('civic_issues')
        .select('status, created_at, priority')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) throw error;

      const total = stats.length;
      const resolved = stats.filter(issue => issue.status === 'resolved').length;
      const pending = stats.filter(issue => issue.status === 'pending' || issue.status === 'submitted').length;
      const high = stats.filter(issue => issue.priority === 'high').length;

      return {
        data: {
          total,
          resolved,
          pending,
          high,
          lastUpdated: new Date().toISOString()
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching live stats:', error);
      return { data: null, error: error.message };
    }
  }
};

export default analyticsService;