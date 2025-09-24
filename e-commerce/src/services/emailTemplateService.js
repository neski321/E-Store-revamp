/**
 * Email Template Service
 * Handles all email template related API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class EmailTemplateService {
  /**
   * Get all email templates
   * @param {string} templateType - Filter by template type
   * @param {boolean} activeOnly - Whether to get only active templates
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Templates data
   */
  static async getTemplates(templateType = null, activeOnly = true, currentUser = null, role = 'user') {
    try {
      let url = `${API_BASE_URL}/email/templates/`;
      const params = new URLSearchParams();
      
      if (templateType) params.append('type', templateType);
      if (activeOnly) params.append('active_only', 'true');
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get templates');
      }

      return data;
    } catch (error) {
      console.error('Get templates error:', error);
      throw error;
    }
  }

  /**
   * Create new newsletter template
   * @param {Object} templateData - Template data
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Created template data
   */
  static async createTemplate(templateData, currentUser = null, role = 'user') {
    try {
      const response = await fetch(`${API_BASE_URL}/email/templates/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
        body: JSON.stringify(templateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create template');
      }

      return data;
    } catch (error) {
      console.error('Create template error:', error);
      throw error;
    }
  }

  /**
   * Get specific newsletter template
   * @param {number} templateId - Template ID
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Template data
   */
  static async getTemplate(templateId, currentUser = null, role = 'user') {
    try {
      const response = await fetch(`${API_BASE_URL}/email/templates/${templateId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get template');
      }

      return data;
    } catch (error) {
      console.error('Get template error:', error);
      throw error;
    }
  }

  /**
   * Update newsletter template
   * @param {number} templateId - Template ID
   * @param {Object} templateData - Updated template data
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Updated template data
   */
  static async updateTemplate(templateId, templateData, currentUser = null, role = 'user') {
    try {
      const response = await fetch(`${API_BASE_URL}/email/templates/${templateId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
        body: JSON.stringify(templateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update template');
      }

      return data;
    } catch (error) {
      console.error('Update template error:', error);
      throw error;
    }
  }

  /**
   * Delete newsletter template
   * @param {number} templateId - Template ID
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Response data
   */
  static async deleteTemplate(templateId, currentUser = null, role = 'user') {
    try {
      const response = await fetch(`${API_BASE_URL}/email/templates/${templateId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete template');
      }

      return data;
    } catch (error) {
      console.error('Delete template error:', error);
      throw error;
    }
  }

  /**
   * Send newsletter using template
   * @param {number} templateId - Template ID
   * @param {string} email - Recipient email
   * @param {Object} variables - Template variables
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Response data
   */
  static async sendWithTemplate(templateId, email, variables = {}, currentUser = null, role = 'user') {
    try {
      const response = await fetch(`${API_BASE_URL}/email/send-with-template/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
        body: JSON.stringify({
          template_id: templateId,
          email: email,
          variables: variables
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send newsletter with template');
      }

      return data;
    } catch (error) {
      console.error('Send with template error:', error);
      throw error;
    }
  }

  /**
   * Get template types
   * @returns {Array} Available template types
   */
  static getTemplateTypes() {
    return [
      { value: 'welcome', label: 'Welcome Email' },
      { value: 'promotional', label: 'Promotional' },
      { value: 'newsletter', label: 'Newsletter' },
      { value: 'announcement', label: 'Announcement' },
      { value: 'custom', label: 'Custom' }
    ];
  }

  /**
   * Format template for display
   * @param {Object} template - Template object
   * @returns {Object} Formatted template
   */
  static formatTemplate(template) {
    return {
      ...template,
      created_at: template.created_at ? new Date(template.created_at).toLocaleDateString() : '',
      updated_at: template.updated_at ? new Date(template.updated_at).toLocaleDateString() : ''
    };
  }
}

export default EmailTemplateService;
