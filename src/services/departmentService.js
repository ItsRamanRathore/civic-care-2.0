import apiClient from '../lib/apiClient';

export const departmentService = {
  // Get all departments
  async getDepartments() {
    try {
      const response = await apiClient.get('/departments');
      return { data: response.data.data || [], error: null };
    } catch (error) {
      console.error('Error fetching departments:', error);
      return { data: [], error: error.response?.data?.message || error.message };
    }
  },

  // Get department by ID
  async getDepartmentById(id) {
    try {
      const response = await apiClient.get(`/departments/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error fetching department:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Create a new department (admin only)
  async createDepartment(departmentData) {
    try {
      const response = await apiClient.post('/departments', {
        name: departmentData.name,
        description: departmentData.description,
        contact_email: departmentData.contactEmail,
        contact_phone: departmentData.contactPhone
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error creating department:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Update department (admin only)
  async updateDepartment(id, departmentData) {
    try {
      const response = await apiClient.patch(`/departments/${id}`, {
        name: departmentData.name,
        description: departmentData.description,
        contact_email: departmentData.contactEmail,
        contact_phone: departmentData.contactPhone,
        is_active: departmentData.isActive
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error updating department:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Delete/deactivate department (admin only)
  async deleteDepartment(id) {
    try {
      const response = await apiClient.delete(`/departments/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error deleting department:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  // Get department statistics
  async getDepartmentStats(departmentId) {
    try {
      const response = await apiClient.get(`/departments/${departmentId}/stats`);
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error fetching department stats:', error);
      return { data: null, error: error.response?.data?.message || error.message };
    }
  }
};

export default departmentService;