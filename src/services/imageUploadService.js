import apiClient from '../lib/apiClient';

export const imageUploadService = {
  // Upload image to backend (which handles Cloudinary)
  async uploadIssueImage(file, issueId, userId) {
    try {
      const formData = new FormData();
      formData.append('images', file);
      formData.append('issue_id', issueId);

      const response = await apiClient.post(`/issues/${issueId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { 
        data: response.data.data, 
        error: null 
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Get images for an issue
  async getIssueImages(issueId) {
    try {
      const response = await apiClient.get(`/issues/${issueId}/images`);
      return { data: response.data.data || [], error: null };
    } catch (error) {
      console.error('Error fetching issue images:', error);
      return { data: [], error: error.response?.data?.message || error.message };
    }
  },

  // Delete an image
  async deleteImage(imageId) {
    try {
      const response = await apiClient.delete(`/images/${imageId}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Validate file before upload
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    
    if (file?.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    
    if (!allowedTypes?.includes(file?.type)) {
      return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
    }
    
    return { valid: true, error: null };
  }
};

export default imageUploadService;