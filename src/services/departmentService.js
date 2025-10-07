import { supabase } from '../lib/supabase';

export const departmentService = {
  // Get all departments
  async getDepartments() {
    try {
      const { data, error } = await supabase?.from('departments')?.select('*')?.eq('is_active', true)?.order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching departments:', error);
      return { data: [], error: error?.message };
    }
  },

  // Get department by ID
  async getDepartmentById(id) {
    try {
      const { data, error } = await supabase?.from('departments')?.select('*')?.eq('id', id)?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching department:', error);
      return { data: null, error: error?.message };
    }
  },

  // Create a new department (admin only)
  async createDepartment(departmentData) {
    try {
      const { data, error } = await supabase?.from('departments')?.insert([{
          name: departmentData?.name,
          description: departmentData?.description,
          contact_email: departmentData?.contactEmail,
          contact_phone: departmentData?.contactPhone
        }])?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error creating department:', error);
      return { data: null, error: error?.message };
    }
  },

  // Update department (admin only)
  async updateDepartment(id, departmentData) {
    try {
      const { data, error } = await supabase?.from('departments')?.update({
          name: departmentData?.name,
          description: departmentData?.description,
          contact_email: departmentData?.contactEmail,
          contact_phone: departmentData?.contactPhone,
          is_active: departmentData?.isActive
        })?.eq('id', id)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error updating department:', error);
      return { data: null, error: error?.message };
    }
  },

  // Delete/deactivate department (admin only)
  async deleteDepartment(id) {
    try {
      // Check if department has assigned issues
      const { data: issuesCount, error: countError } = await supabase?.from('civic_issues')?.select('id', { count: 'exact' })?.eq('assigned_department_id', id);

      if (countError) {
        throw countError;
      }

      if (issuesCount && issuesCount?.length > 0) {
        // Deactivate instead of delete if has assigned issues
        const { data, error } = await supabase?.from('departments')?.update({ is_active: false })?.eq('id', id)?.select()?.single();

        if (error) {
          throw error;
        }

        return { 
          data: { ...data, action: 'deactivated' }, 
          error: null,
          message: 'Department deactivated due to existing issue assignments'
        };
      } else {
        // Safe to delete
        const { error } = await supabase?.from('departments')?.delete()?.eq('id', id);

        if (error) {
          throw error;
        }

        return { 
          data: { action: 'deleted' }, 
          error: null,
          message: 'Department deleted successfully'
        };
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get department statistics
  async getDepartmentStats(departmentId) {
    try {
      const { data, error } = await supabase?.from('civic_issues')?.select('status, priority, created_at')?.eq('assigned_department_id', departmentId);

      if (error) {
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        byStatus: {},
        byPriority: {},
        resolved: 0,
        pending: 0,
        avgResolutionTime: null
      };

      const now = new Date();
      let totalResolutionTime = 0;
      let resolvedCount = 0;

      data?.forEach(issue => {
        // Count by status
        stats.byStatus[issue.status] = (stats?.byStatus?.[issue?.status] || 0) + 1;
        
        // Count by priority
        stats.byPriority[issue.priority] = (stats?.byPriority?.[issue?.priority] || 0) + 1;
        
        // Count resolved/pending
        if (['resolved', 'closed']?.includes(issue?.status)) {
          stats.resolved++;
          
          // Calculate resolution time for completed issues
          if (issue?.resolved_at) {
            const createdAt = new Date(issue.created_at);
            const resolvedAt = new Date(issue.resolved_at);
            const resolutionTime = resolvedAt - createdAt;
            totalResolutionTime += resolutionTime;
            resolvedCount++;
          }
        } else {
          stats.pending++;
        }
      });

      // Calculate average resolution time in days
      if (resolvedCount > 0) {
        const avgTimeMs = totalResolutionTime / resolvedCount;
        stats.avgResolutionTime = Math.round(avgTimeMs / (1000 * 60 * 60 * 24 * 100)) / 100; // Days
      }

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching department stats:', error);
      return { data: null, error: error?.message };
    }
  }
};

export default departmentService;