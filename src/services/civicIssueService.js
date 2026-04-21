import apiClient from '../lib/apiClient';

export const civicIssueService = {
  // Get all civic issues with optional filters
  async getIssues(filters = {}) {
    try {
      const response = await apiClient.get('/issues', { params: filters });
      const normalizedData = (response.data.data || []).map(issue => civicIssueService._normalizeIssue(issue));
      return { data: normalizedData, error: null };
    } catch (error) {
      console.error('Error fetching civic issues:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Get a single issue by ID
  async getIssueById(id) {
    try {
      const response = await apiClient.get(`/issues/${id}`);
      return { data: civicIssueService._normalizeIssue(response.data.data), error: null };
    } catch (error) {
      console.error('Error fetching issue:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Helper to normalize issue data for frontend components
  _normalizeIssue(issue) {
    if (!issue) return null;
    
    // Standardize IDs
    const id = issue.id || issue._id || issue.issue_id;
    
    // Standardize Images
    const images = issue.images || issue.issue_images?.map(img => img.image_url || img.image_path) || [];
    const image = images[0] || '';
    
    // Standardize Timestamps
    const createdAt = issue.created_at || issue.createdAt || issue.reportedAt;
    
    // Standardize Reporter
    const reporter = issue.reporter || { 
      name: issue.reporter_name || issue.user_profiles?.full_name || 'Anonymous', 
      id: issue.reporter_id || issue.user_id 
    };

    // Standardize Votes
    const votes = issue.votes || { 
      upvotes: issue.upvoteCount || issue.issue_votes?.filter(v => v.vote_type === 'upvote').length || 0, 
      comments: issue.issue_updates?.filter(u => u.comment).length || 0 
    };

    // Ensure all critical fields exist and match legacy/new expectations
    return {
      ...issue,
      id,
      images,
      image, // Shared legacy property
      imageCount: images.length,
      reporter,
      user_profiles: { full_name: reporter.name }, // Legacy property
      votes,
      upvoteCount: votes.upvotes, // Shared property
      address: issue.address || issue.location_name || 'Location not specified',
      location: issue.address || issue.location_name || 'Location not specified', // Legacy property
      created_at: createdAt,
      createdAt, // Shared property
      reportedAt: createdAt,
      coordinates: issue.coordinates || (issue.latitude ? { lat: issue.latitude, lng: issue.longitude } : null)
    };
  },

  // Get civic issues for a specific user
  async getCivicIssuesByUser(userId) {
    try {
      const response = await apiClient.get(`/issues?reporter_id=${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user civic issues:', error);
      throw error;
    }
  },

  // Backward compatibility wrapper
  async getAllCivicIssues() {
    return civicIssueService.getIssues();
  },

  // Create a new civic issue
  async createIssue(issueData) {
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('title', issueData.title);
      formData.append('description', issueData.description);
      formData.append('category', issueData.category);
      formData.append('priority', issueData.priority || 'medium');
      formData.append('address', issueData.location.address);
      if (issueData.location.coordinates) {
        formData.append('latitude', issueData.location.coordinates.lat);
        formData.append('longitude', issueData.location.coordinates.lng);
      }
      
      // Contact info
      if (issueData.contactInfo) {
        formData.append('reporter_name', issueData.contactInfo.name);
        formData.append('reporter_email', issueData.contactInfo.email);
        formData.append('reporter_phone', issueData.contactInfo.phone);
      }

      // Append images
      if (issueData.images && issueData.images.length > 0) {
        issueData.images.forEach((image) => {
          formData.append('images', image.file);
        });
      }

      const response = await apiClient.post('/issues', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { data: response.data.data, error: null, success: true };
    } catch (error) {
      console.error('Issue creation failed:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || error.message, 
        success: false 
      };
    }
  },

  // Update issue status (admin only)
  async updateIssueStatus(issueId, status, comment = null) {
    try {
      const response = await apiClient.patch(`/issues/${issueId}/status`, { status, comment });
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error updating issue status:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Vote on an issue
  async voteOnIssue(issueId, voteType = 'upvote') {
    try {
      const response = await apiClient.post(`/issues/${issueId}/vote`, { vote_type: voteType });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error voting on issue:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Get user's votes for issues
  async getUserVotes(issueIds) {
    // This could be optimized on the backend, but for now we'll just return an empty array 
    // or implement a specific endpoint if needed.
    return { data: [], error: null };
  },

  // Get comments for an issue
  async getComments(issueId) {
    try {
      const response = await apiClient.get(`/issues/${issueId}/comments`);
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Add a comment to an issue
  async addComment(issueId, text) {
    try {
      const response = await apiClient.post(`/issues/${issueId}/comments`, { text });
      return { data: response.data.data, status: response.data.status, error: null };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Track complaint by ID and email (Mocked for now or use filter)
  async trackComplaint(complaintId, email) {
    try {
      const response = await apiClient.get(`/issues/${complaintId}`);
      // Verify email match if needed
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error tracking complaint:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Real-time updates subscription
  subscribeToIssueChanges(callback) {
    // Note: Socket.io should ideally be initialized as a singleton.
    // This is a defensive implementation to avoid breaking changes.
    try {
      // Use dynamic import for ESM/Vite compatibility
      import('socket.io-client').then(({ io }) => {
        const socket = io(window.location.protocol + '//' + window.location.hostname + ':5000');
        socket.on('issueChange', (payload) => {
          callback(payload);
        });
        return socket;
      }).catch(err => {
        console.error('Socket.io load failed:', err);
      });
    } catch (e) {
      console.error('Socket subscribe error:', e);
    }
  },

  // Get issue statistics (Unified for Phase 3)
  async getIssuesStats() {
    try {
      const response = await apiClient.get('/issues/stats/analytics');
      const stats = response.data.data;
      
      // Map rich analytics data back to legacy stats format for compatibility
      const timeline = stats?.timeline || [];
      const distribution = stats?.distribution || {};
      
      const total = timeline.reduce((sum, d) => sum + (d.reported || 0), 0);
      const resolved = timeline.reduce((sum, d) => sum + (d.resolved || 0), 0);
      const pending = (distribution.byStatus || [])
        .filter(s => ['submitted', 'in_review', 'assigned'].includes(s._id))
        .reduce((sum, s) => sum + s.count, 0);
      const inProgress = (distribution.byStatus || [])
        .filter(s => s._id === 'in_progress')
        .reduce((sum, s) => sum + s.count, 0);

      // Create mapping objects for distributions
      const byCategory = {};
      (distribution.byCategory || []).forEach(c => { byCategory[c._id] = c.count; });
      
      const byStatus = {};
      (distribution.byStatus || []).forEach(s => { byStatus[s._id] = s.count; });
      
      const byPriority = {};
      (distribution.byPriority || []).forEach(p => { byPriority[p._id] = p.count; });

      return { 
        data: {
          total,
          resolved,
          pending,
          inProgress,
          recentCount: timeline.slice(-7).reduce((sum, d) => sum + (d.reported || 0), 0),
          byCategory,
          byStatus,
          byPriority,
          enriched: stats // Keep the full data for new components
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching issue stats:', error);
      return { 
        data: {
          total: 0, resolved: 0, pending: 0, inProgress: 0, recentCount: 0,
          byCategory: {}, byStatus: {}, byPriority: {}
        }, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Add issue update/comment
  async addIssueUpdate(issueId, status, comment, isPublic = true) {
    try {
      const response = await apiClient.post(`/issues/${issueId}/updates`, { 
        status, 
        comment, 
        is_public: isPublic 
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error adding issue update:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  unsubscribeFromChanges(socket) {
    if (socket) {
      socket.disconnect();
    }
  },

  async analyzeIssue(description) {
    try {
      const response = await apiClient.post('/issues/analyze', { description });
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return { data: null, error: error.response?.data?.message || 'AI service currently unavailable' };
    }
  }
};

// Exporting individual functions for backward compatibility with old imports
export const getAllCivicIssues = civicIssueService.getAllCivicIssues;
export const getCivicIssuesByUser = civicIssueService.getCivicIssuesByUser;
export const analyzeIssue = civicIssueService.analyzeIssue;