/**
 * Service for managing email template assignments
 * Allows admins to select which template to use for different purposes
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class TemplateAssignmentService {
  /**
   * Get all template assignments
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Assignments data
   */
  static async getAssignments(currentUser = null, role = 'user') {
    try {
      const url = `${API_BASE_URL}/email/template-assignments/`;
      const headers = {
        'Content-Type': 'application/json',
        'X-User-ID': currentUser?.uid || '',
        'X-User-Role': role || 'user',
      };
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching template assignments:', error);
      throw new Error(error.message || 'Failed to fetch template assignments');
    }
  }

  /**
   * Create a new template assignment
   * @param {Object} assignmentData - Assignment data
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Created assignment
   */
  static async createAssignment(assignmentData, currentUser = null, role = 'user') {
    try {
      const url = `${API_BASE_URL}/email/template-assignments/create/`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating template assignment:', error);
      throw new Error(error.message || 'Failed to create template assignment');
    }
  }

  /**
   * Update a template assignment
   * @param {number} assignmentId - Assignment ID
   * @param {Object} assignmentData - Updated assignment data
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Updated assignment
   */
  static async updateAssignment(assignmentId, assignmentData, currentUser = null, role = 'user') {
    try {
      const url = `${API_BASE_URL}/email/template-assignments/${assignmentId}/update/`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating template assignment:', error);
      throw new Error(error.message || 'Failed to update template assignment');
    }
  }

  /**
   * Delete a template assignment
   * @param {number} assignmentId - Assignment ID
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteAssignment(assignmentId, currentUser = null, role = 'user') {
    try {
      const url = `${API_BASE_URL}/email/template-assignments/${assignmentId}/delete/`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting template assignment:', error);
      throw new Error(error.message || 'Failed to delete template assignment');
    }
  }

  /**
   * Get template assigned for a specific purpose
   * @param {string} purpose - Purpose key
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Template data
   */
  static async getTemplateForPurpose(purpose, currentUser = null, role = 'user') {
    try {
      const url = `${API_BASE_URL}/email/template-for-purpose/${purpose}/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching template for purpose:', error);
      throw new Error(error.message || 'Failed to fetch template for purpose');
    }
  }

  /**
   * Get available purpose choices
   * @returns {Array} Purpose choices
   */
  static getPurposeChoices() {
    return [
      { value: 'new_user_welcome', label: 'New User Welcome' },
      { value: 'newsletter_send', label: 'Newsletter Sending' },
      { value: 'promotional_campaign', label: 'Promotional Campaign' },
      { value: 'product_announcement', label: 'Product Announcement' },
      { value: 'system_notification', label: 'System Notification' },
      { value: 'custom_use', label: 'Custom Use' }
    ];
  }
}

export default TemplateAssignmentService;
