// src/services/newsletterService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class NewsletterService {
  /**
   * Subscribe to newsletter
   * @param {string} email - Email address
   * @param {string} source - Source of subscription (footer, signup, etc.)
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Response data
   */
  static async subscribe(email, source = 'footer', preferences = {}) {
    try {
      const url = `${API_BASE_URL}/newsletter/subscribe/`;
      const requestBody = {
        email: email.trim().toLowerCase(),
        source,
        preferences
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': localStorage.getItem('userId') || '',
          'X-User-Role': localStorage.getItem('userRole') || 'user',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error response formats
        let errorMessage = 'Failed to subscribe to newsletter';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.email && Array.isArray(data.email)) {
          errorMessage = data.email[0];
        } else if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from newsletter
   * @param {string} email - Email address
   * @returns {Promise<Object>} Response data
   */
  static async unsubscribe(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/unsubscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unsubscribe from newsletter');
      }

      return data;
    } catch (error) {
      console.error('Newsletter unsubscription error:', error);
      throw error;
    }
  }

  /**
   * Check if email is subscribed to newsletter
   * @param {string} email - Email address
   * @returns {Promise<Object>} Subscription status
   */
  static async checkSubscription(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/check/?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check subscription status');
      }

      return data;
    } catch (error) {
      console.error('Newsletter check error:', error);
      throw error;
    }
  }

  /**
   * Get all newsletter subscribers (admin only)
   * @param {boolean} activeOnly - Whether to get only active subscribers
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Subscribers data
   */
  static async getSubscribers(activeOnly = true, currentUser = null, role = 'user') {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/subscribers/?active_only=${activeOnly}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get subscribers');
      }

      return data;
    } catch (error) {
      console.error('Get subscribers error:', error);
      throw error;
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {boolean} Whether email is valid
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Admin unsubscribe from newsletter (admin only)
   * @param {string} email - Email address to unsubscribe
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Response data
   */
  static async adminUnsubscribe(email, currentUser = null, role = 'user') {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/admin-unsubscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unsubscribe user from newsletter');
      }

      return data;
    } catch (error) {
      console.error('Admin unsubscribe error:', error);
      throw error;
    }
  }

  /**
   * Send newsletter to specific subscriber (admin only)
   * @param {string} email - Email address to send newsletter to
   * @param {string} subject - Newsletter subject
   * @param {string} content - Newsletter content
   * @param {boolean} isHtml - Whether content is HTML
   * @param {Object} currentUser - Current user object from AuthContext
   * @param {string} role - User role from AuthContext
   * @returns {Promise<Object>} Response data
   */
  static async sendNewsletterToSubscriber(email, subject, content, isHtml = true, currentUser = null, role = 'user') {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/send-to-subscriber/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid || '',
          'X-User-Role': role || 'user',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          content: content.trim(),
          is_html: isHtml
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send newsletter to subscriber');
      }

      return data;
    } catch (error) {
      console.error('Send newsletter to subscriber error:', error);
      throw error;
    }
  }

  /**
   * Format email for display
   * @param {string} email - Email address
   * @returns {string} Formatted email
   */
  static formatEmail(email) {
    return email.trim().toLowerCase();
  }
}

export default NewsletterService;
