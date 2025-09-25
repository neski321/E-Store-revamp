// src/pages/NewsletterManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NewsletterService from '../services/newsletterService';
import EmailTemplateService from '../services/emailTemplateService';
import EnhancedTextEditor from '../components/EnhancedTextEditor';
import SuccessDialog from '../components/SuccessDialog';
import ErrorDialog from '../components/ErrorDialog';

const NewsletterManagement = () => {
  const { currentUser, role, loading: authLoading } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0
  });
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterCustomEmail, setNewsletterCustomEmail] = useState('');
  const [newsletterEmailType, setNewsletterEmailType] = useState('subscriber'); // 'subscriber', 'custom', 'multiple', 'all'
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [newsletterIsHtml, setNewsletterIsHtml] = useState(true);
  const [sendToNonSubscribers, setSendToNonSubscribers] = useState(false);
  const [subscriberSearchTerm, setSubscriberSearchTerm] = useState('');
  
  // Template-related states
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  
  // Dialog states
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });
  const [templateVariables, setTemplateVariables] = useState({});
  const [useTemplate, setUseTemplate] = useState(false);
  
  // Template form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    template_type: 'newsletter',
    subject: '',
    html_content: '',
    plain_text_content: '',
    description: '',
    is_active: true,
    is_default: false,
    variables: {}
  });

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NewsletterService.getSubscribers(activeOnly, currentUser, role);
      setSubscribers(data.subscribers);
      setStats({
        totalCount: data.total_count,
        activeCount: data.active_count
      });
    } catch (err) {
      setError('Failed to fetch subscribers');
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoading(false);
    }
  }, [activeOnly, currentUser, role]);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await EmailTemplateService.getTemplates(null, true, currentUser, role);
      setTemplates(data.templates);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }, [currentUser, role]);

  useEffect(() => {
    // Wait for auth to load before checking permissions
    if (authLoading) {
      return;
    }
    
        // Check if user is admin before fetching data
        if (currentUser && role === 'admin') {
          fetchSubscribers();
          fetchTemplates();
        } else if (currentUser && role !== 'admin') {
          setError('Admin access required to view newsletter subscribers');
          setLoading(false);
        } else if (!currentUser) {
          setError('Please log in to access this page');
          setLoading(false);
        }
  }, [fetchSubscribers, fetchTemplates, currentUser, role, authLoading]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUnsubscribeClick = (email) => {
    setUnsubscribeEmail(email);
    setShowUnsubscribeModal(true);
  };

  const handleUnsubscribeConfirm = async () => {
    try {
      setUnsubscribing(true);
      setError('');
      
      await NewsletterService.adminUnsubscribe(unsubscribeEmail, currentUser, role);
      
      // Refresh the subscribers list
      await fetchSubscribers();
      
      setShowUnsubscribeModal(false);
      setUnsubscribeEmail('');
    } catch (err) {
      setError(err.message || 'Failed to unsubscribe user');
      console.error('Error unsubscribing user:', err);
    } finally {
      setUnsubscribing(false);
    }
  };

  const handleUnsubscribeCancel = () => {
    setShowUnsubscribeModal(false);
    setUnsubscribeEmail('');
  };

  const handleSendNewsletterClick = (email) => {
    // Reset all newsletter form state
    setNewsletterEmail(email);
    setNewsletterCustomEmail('');
    setNewsletterEmailType('subscriber'); // Set to single subscriber mode
    setSelectedSubscribers([]);
    setNewsletterSubject('');
    setNewsletterContent('');
    setNewsletterIsHtml(true);
    setSelectedTemplate(null);
    
    // Auto-populate template variables with subscriber information
    const selectedSubscriber = subscribers.find(sub => sub.email === email);
    if (selectedSubscriber) {
      const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';
      const autoVariables = {
        email: selectedSubscriber.email,
        name: selectedSubscriber.preferences?.name || selectedSubscriber.email.split('@')[0] || 'Valued Customer',
        company: 'E-Store',
        website: frontendUrl,
        shop_url: `${frontendUrl}/products`,
        login_url: `${frontendUrl}/login`,
        unsubscribe_url: `${frontendUrl}/unsubscribe?email=${selectedSubscriber.email}`,
        support_email: 'support@yourstore.com'
      };
      setTemplateVariables(autoVariables);
    } else {
      setTemplateVariables({});
    }
    
    setUseTemplate(false);
    setSendToNonSubscribers(false);
    setSubscriberSearchTerm('');
    setShowNewsletterModal(true);
  };

  const handleSendNewsletterConfirm = async () => {
    try {
      setSendingNewsletter(true);
      setError('');
      
      let emails = [];
      
      // Determine recipients based on email type
      if (newsletterEmailType === 'subscriber') {
        emails = [newsletterEmail];
      } else if (newsletterEmailType === 'custom') {
        emails = [newsletterCustomEmail];
      } else if (newsletterEmailType === 'multiple') {
        emails = selectedSubscribers;
      } else if (newsletterEmailType === 'all') {
        // Send to all active subscribers
        const response = await NewsletterService.sendToAllSubscribers({
          subject: newsletterSubject,
          content: newsletterContent,
          is_html: newsletterIsHtml,
          template_id: selectedTemplate?.id,
          template_variables: templateVariables
        }, currentUser, role);
        
        if (response.success) {
          resetNewsletterForm();
          setShowNewsletterModal(false);
          alert(`Newsletter sent successfully to ${response.recipient_count} subscribers!`);
          await fetchSubscribers();
        }
        return;
      }
      
      if (emails.length === 0) {
        setError('Please select at least one email address');
        return;
      }
      
      // Always use the enhanced newsletter endpoint that supports templates and non-subscribers
      const response = await NewsletterService.sendNewsletterToSubscriber(
        emails, 
        newsletterSubject, 
        newsletterContent, 
        newsletterIsHtml, 
        sendToNonSubscribers,
        currentUser, 
        role,
        useTemplate && selectedTemplate ? selectedTemplate.id : null,
        templateVariables
      );
      
      if (response.success) {
        let message = `Newsletter sent successfully to ${response.success_count} recipient(s)!`;
        if (response.warning) {
          message += ` ${response.warning}`;
        }
        if (response.failed_count > 0) {
          message += ` Failed to send to ${response.failed_count} recipient(s).`;
        }
        
        setSuccessDialog({
          isOpen: true,
          title: 'Newsletter Sent Successfully! 📧',
          message: message
        });
      }
      
      resetNewsletterForm();
      setShowNewsletterModal(false);
      
      // Refresh subscribers list
      await fetchSubscribers();
    } catch (err) {
      console.error('Error sending newsletter:', err);
      setErrorDialog({
        isOpen: true,
        title: 'Failed to Send Newsletter',
        message: err.message || 'Failed to send newsletter. Please try again.',
        details: err.message
      });
    } finally {
      setSendingNewsletter(false);
    }
  };
  
  const resetNewsletterForm = () => {
    setNewsletterEmail('');
    setNewsletterCustomEmail('');
    setNewsletterEmailType('subscriber');
    setSelectedSubscribers([]);
    setNewsletterSubject('');
    setNewsletterContent('');
    setSelectedTemplate(null);
    setTemplateVariables({});
    setUseTemplate(false);
    setSendToNonSubscribers(false);
    setSubscriberSearchTerm('');
  };

  const handleSendNewsletterCancel = () => {
    setShowNewsletterModal(false);
    resetNewsletterForm();
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setNewsletterSubject(template.subject);
    setNewsletterContent(template.html_content);
    setNewsletterIsHtml(true);
    setTemplateVariables({});
  };

  const handleCreateTemplate = async () => {
    try {
      setError('');
      await EmailTemplateService.createTemplate(templateForm, currentUser, role);
      setShowCreateTemplateModal(false);
      resetTemplateForm();
      await fetchTemplates();
    } catch (err) {
      setError(err.message || 'Failed to create template');
      console.error('Error creating template:', err);
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      template_type: 'newsletter',
      subject: '',
      html_content: '',
      plain_text_content: '',
      description: '',
      is_active: true,
      is_default: false,
      variables: {}
    });
  };

  const handleTextContentChange = (plainText, htmlContent) => {
    let finalHtmlContent = htmlContent;
    
    // For existing templates with table layout, preserve the original HTML content
    // but sync variable formats from plain text to HTML
    if (selectedTemplate && selectedTemplate.html_content && selectedTemplate.html_content.includes('<table')) {
      finalHtmlContent = selectedTemplate.html_content;
      
      // Extract variables from plain text and update HTML content to match
      const plainTextVariables = plainText.match(/\{[^}]+\}/g) || [];
      const uniqueVariables = [...new Set(plainTextVariables)];
      
      // Update HTML content to use the same variable format as plain text
      uniqueVariables.forEach(variable => {
        // Find all possible formats of this variable in HTML
        const variableName = variable.replace(/{|}/g, '');
        const formats = [
          `{{{{${variableName}}}}}`,     // 4 brackets: {{{{company}}}}
          `{{${variableName}}}}}`,       // 3 brackets: {{{company}}}
          `{{${variableName}}}`,         // 2 brackets: {{name}}
          `{${variableName}}`,           // 1 bracket: {name}
        ];
        
        // Replace all formats with the plain text format
        formats.forEach(format => {
          if (finalHtmlContent.includes(format)) {
            finalHtmlContent = finalHtmlContent.replaceAll(format, variable);
          }
        });
      });
    }
    
    setTemplateForm({
      ...templateForm,
      plain_text_content: plainText,
      html_content: finalHtmlContent
    });
  };

  const templateTypes = EmailTemplateService.getTemplateTypes();

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Status', 'Subscribed At', 'Unsubscribed At', 'Source', 'User ID'],
      ...subscribers.map(sub => [
        sub.email,
        sub.is_active ? 'Active' : 'Inactive',
        sub.subscribed_at ? formatDate(sub.subscribed_at) : '',
        sub.unsubscribed_at ? formatDate(sub.unsubscribed_at) : '',
        sub.subscription_source || 'footer',
        sub.user_id || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Newsletter Management</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setNewsletterEmailType('subscriber');
                    setNewsletterEmail('');
                    setNewsletterCustomEmail('');
                    setNewsletterSubject('');
                    setNewsletterContent('');
                    setNewsletterIsHtml(true);
                    setSelectedTemplate(null);
                    setTemplateVariables({});
                    setUseTemplate(false);
                    setShowNewsletterModal(true);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send Newsletter</span>
                </button>
                <button
                  onClick={exportSubscribers}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Export CSV
                </button>
                <button
                  onClick={fetchSubscribers}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-primary-600">{stats.activeCount}</div>
                <div className="text-sm text-gray-600">Active Subscribers</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-600">{stats.totalCount}</div>
                <div className="text-sm text-gray-600">Total Subscribers</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-red-600">{stats.totalCount - stats.activeCount}</div>
                <div className="text-sm text-gray-600">Unsubscribed</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show only active subscribers</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {/* Subscribers Table */}
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Subscribed
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Unsubscribed
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Source
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    User ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading || authLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {authLoading ? 'Loading user information...' : 'Loading subscribers...'}
                    </td>
                  </tr>
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  subscribers.map((subscriber) => (
                    <tr key={subscriber.email} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs font-medium text-gray-900 truncate">
                        {subscriber.email}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                          subscriber.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscriber.is_active ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {subscriber.unsubscribed_at ? new Date(subscriber.unsubscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {subscriber.subscription_source?.slice(0, 6) || 'footer'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {subscriber.user_id ? subscriber.user_id.slice(-4) : '-'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex space-x-1">
                          {subscriber.is_active ? (
                            <>
                              <button
                                onClick={() => handleSendNewsletterClick(subscriber.email)}
                                className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={sendingNewsletter}
                                title="Send Newsletter"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleUnsubscribeClick(subscriber.email)}
                                className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={unsubscribing}
                                title="Unsubscribe"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">Unsubscribed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {subscribers.length} of {stats.totalCount} subscribers
            </div>
          </div>
        </div>
      </div>

      {/* Unsubscribe Confirmation Modal */}
      {showUnsubscribeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Confirm Unsubscribe</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to unsubscribe <strong>{unsubscribeEmail}</strong> from the newsletter?
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  This action cannot be undone. The user will need to resubscribe manually.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={handleUnsubscribeCancel}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 transition-colors duration-200"
                  disabled={unsubscribing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnsubscribeConfirm}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                  disabled={unsubscribing}
                >
                  {unsubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Composition Modal */}
      {showNewsletterModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {newsletterEmailType === 'subscriber' ? 'Send Newsletter' : 'Send Newsletter to Custom Email'}
                </h3>
                <button
                  onClick={handleSendNewsletterCancel}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={sendingNewsletter}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Email Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send To
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="emailType"
                        value="subscriber"
                        checked={newsletterEmailType === 'subscriber'}
                        onChange={(e) => setNewsletterEmailType(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        disabled={sendingNewsletter}
                      />
                      <span className="ml-2 text-sm text-gray-700">Single Subscriber</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="emailType"
                        value="custom"
                        checked={newsletterEmailType === 'custom'}
                        onChange={(e) => setNewsletterEmailType(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        disabled={sendingNewsletter}
                      />
                      <span className="ml-2 text-sm text-gray-700">Custom Email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="emailType"
                        value="multiple"
                        checked={newsletterEmailType === 'multiple'}
                        onChange={(e) => setNewsletterEmailType(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        disabled={sendingNewsletter}
                      />
                      <span className="ml-2 text-sm text-gray-700">Multiple Subscribers</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="emailType"
                        value="all"
                        checked={newsletterEmailType === 'all'}
                        onChange={(e) => setNewsletterEmailType(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        disabled={sendingNewsletter}
                      />
                      <span className="ml-2 text-sm text-gray-700">All Subscribers</span>
                    </label>
                  </div>
                </div>

                {/* Email Input based on type */}
                {newsletterEmailType !== 'all' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {newsletterEmailType === 'subscriber' ? 'Select Subscriber' : 
                       newsletterEmailType === 'custom' ? 'Email Address' : 
                       'Select Multiple Subscribers'}
                    </label>
                    
                      {newsletterEmailType === 'subscriber' ? (
                        <select
                          value={newsletterEmail}
                          onChange={(e) => {
                            setNewsletterEmail(e.target.value);
                            // Auto-populate template variables when subscriber is selected
                            if (e.target.value) {
                              const selectedSubscriber = subscribers.find(sub => sub.email === e.target.value);
                              if (selectedSubscriber) {
                                const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';
                                const updatedVariables = {
                                  ...templateVariables,
                                  email: selectedSubscriber.email,
                                  name: selectedSubscriber.preferences?.name || selectedSubscriber.email.split('@')[0] || 'Valued Customer',
                                  company: 'E-Store',
                                  website: frontendUrl,
                                  shop_url: `${frontendUrl}/products`,
                                  login_url: `${frontendUrl}/login`,
                                  unsubscribe_url: `${frontendUrl}/unsubscribe?email=${selectedSubscriber.email}`,
                                  support_email: 'support@yourstore.com'
                                };
                                setTemplateVariables(updatedVariables);
                              }
                            } else {
                              // Reset variables when no subscriber is selected
                              setTemplateVariables({});
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                          disabled={sendingNewsletter}
                        >
                          <option value="">Select a subscriber...</option>
                          {subscribers.filter(sub => sub.is_active).map(subscriber => (
                            <option key={subscriber.email} value={subscriber.email}>
                              {subscriber.email} {subscriber.user_id ? `(${subscriber.user_id.slice(-4)})` : ''}
                            </option>
                          ))}
                        </select>
                    ) : newsletterEmailType === 'custom' ? (
                      <input
                        type="email"
                        value={newsletterCustomEmail}
                        onChange={(e) => {
                          setNewsletterCustomEmail(e.target.value);
                          // Auto-populate template variables when custom email is entered
                          if (e.target.value) {
                            const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';
                            const updatedVariables = {
                              ...templateVariables,
                              email: e.target.value,
                              name: e.target.value.split('@')[0] || 'Valued Customer',
                              company: 'E-Store',
                              website: frontendUrl,
                              shop_url: `${frontendUrl}/products`,
                              login_url: `${frontendUrl}/login`,
                              unsubscribe_url: `${frontendUrl}/unsubscribe?email=${e.target.value}`,
                              support_email: 'support@yourstore.com'
                            };
                            setTemplateVariables(updatedVariables);
                          } else {
                            // Reset variables when email is cleared
                            setTemplateVariables({});
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
                        required
                        disabled={sendingNewsletter}
                      />
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={subscriberSearchTerm}
                          onChange={(e) => setSubscriberSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Search subscribers..."
                          disabled={sendingNewsletter}
                        />
                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                          {subscribers
                            .filter(sub => sub.is_active && sub.email.toLowerCase().includes(subscriberSearchTerm.toLowerCase()))
                            .map(subscriber => (
                              <label key={subscriber.email} className="flex items-center p-2 hover:bg-gray-50">
                                  <input
                                    type="checkbox"
                                    checked={selectedSubscribers.includes(subscriber.email)}
                                    onChange={(e) => {
                                      let newSelectedSubscribers;
                                      if (e.target.checked) {
                                        newSelectedSubscribers = [...selectedSubscribers, subscriber.email];
                                      } else {
                                        newSelectedSubscribers = selectedSubscribers.filter(email => email !== subscriber.email);
                                      }
                                      setSelectedSubscribers(newSelectedSubscribers);
                                      
                                      // Auto-populate template variables when subscribers are selected
                                      if (newSelectedSubscribers.length > 0) {
                                        const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';
                                        const updatedVariables = {
                                          ...templateVariables,
                                          email: newSelectedSubscribers[0], // Use first selected email
                                          name: 'Multiple Recipients', // Generic name for multiple recipients
                                          company: 'E-Store',
                                          website: frontendUrl,
                                          shop_url: `${frontendUrl}/products`,
                                          login_url: `${frontendUrl}/login`,
                                          unsubscribe_url: `${frontendUrl}/unsubscribe`,
                                          support_email: 'support@yourstore.com'
                                        };
                                        setTemplateVariables(updatedVariables);
                                      } else {
                                        // Reset variables when no subscribers are selected
                                        setTemplateVariables({});
                                      }
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={sendingNewsletter}
                                  />
                                <span className="ml-2 text-sm text-gray-700">
                                  {subscriber.email} {subscriber.user_id ? `(${subscriber.user_id.slice(-4)})` : ''}
                                </span>
                              </label>
                            ))}
                        </div>
                        {selectedSubscribers.length > 0 && (
                          <div className="text-sm text-gray-600">
                            Selected: {selectedSubscribers.length} subscriber(s)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {newsletterEmailType === 'all' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>All Active Subscribers:</strong> This newsletter will be sent to all {stats.activeCount} active subscribers.
                    </p>
                  </div>
                )}

                {/* Template Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Use Template
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCreateTemplateModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Create New Template
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 mb-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useTemplate}
                        onChange={(e) => {
                          setUseTemplate(e.target.checked);
                          if (!e.target.checked) {
                            setSelectedTemplate(null);
                            setNewsletterSubject('');
                            setNewsletterContent('');
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={sendingNewsletter}
                      />
                      <span className="ml-2 text-sm text-gray-700">Use existing template</span>
                    </label>
                  </div>
                  
                  {useTemplate && (
                    <div className="mb-4">
                      <select
                        value={selectedTemplate?.id || ''}
                        onChange={(e) => {
                          const templateId = e.target.value;
                          const template = templates.find(t => t.id === parseInt(templateId));
                          if (template) {
                            handleTemplateSelect(template);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={sendingNewsletter}
                      >
                        <option value="">Select a template...</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({templateTypes.find(t => t.value === template.template_type)?.label})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="newsletter-subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="newsletter-subject"
                    value={newsletterSubject}
                    onChange={(e) => setNewsletterSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter newsletter subject"
                    disabled={sendingNewsletter || (useTemplate && selectedTemplate)}
                  />
                </div>

                <div>
                  <label htmlFor="newsletter-content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    id="newsletter-content"
                    value={newsletterContent}
                    onChange={(e) => setNewsletterContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Enter newsletter content (HTML supported)"
                    disabled={sendingNewsletter || (useTemplate && selectedTemplate)}
                  />
                </div>

                  {/* Template Variables */}
                  {useTemplate && selectedTemplate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Variables
                        {Object.keys(templateVariables).length > 0 && (
                          <span className="ml-2 text-xs text-green-600 font-medium">
                            ✓ Auto-populated from selected recipient
                          </span>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Fill in the variables used in this template (e.g., {'{name}'}, {'{company}'}, {'{website}'}, {'{shop_url}'})
                        {Object.keys(templateVariables).length > 0 && (
                          <span className="text-green-600"> - Variables have been auto-populated with environment-aware URLs</span>
                        )}
                      </p>
                    <div className="space-y-2">
                      {Object.keys(selectedTemplate.variables || {}).map(key => (
                        <div key={key} className="flex space-x-2">
                          <span className="px-3 py-2 bg-gray-100 rounded text-sm font-mono min-w-0 flex-shrink-0">{'{' + key + '}'}</span>
                          <input
                            type="text"
                            value={templateVariables[key] || ''}
                            onChange={(e) => setTemplateVariables({...templateVariables, [key]: e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Value for ${key}`}
                            disabled={sendingNewsletter}
                          />
                        </div>
                      ))}
                      {Object.keys(selectedTemplate.variables || {}).length === 0 && (
                        <p className="text-sm text-gray-500 italic">No variables defined for this template</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Send to non-subscribers option */}
                {(newsletterEmailType === 'custom' || newsletterEmailType === 'multiple') && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="send-to-non-subscribers"
                      checked={sendToNonSubscribers}
                      onChange={(e) => setSendToNonSubscribers(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={sendingNewsletter}
                    />
                    <label htmlFor="send-to-non-subscribers" className="ml-2 block text-sm text-gray-700">
                      Allow sending to non-subscribers
                    </label>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newsletter-html"
                    checked={newsletterIsHtml}
                    onChange={(e) => setNewsletterIsHtml(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={sendingNewsletter}
                  />
                  <label htmlFor="newsletter-html" className="ml-2 block text-sm text-gray-700">
                    Content is HTML
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This newsletter will be sent to{' '}
                    {newsletterEmailType === 'subscriber' && newsletterEmail && <strong>{newsletterEmail}</strong>}
                    {newsletterEmailType === 'custom' && newsletterCustomEmail && <strong>{newsletterCustomEmail}</strong>}
                    {newsletterEmailType === 'multiple' && selectedSubscribers.length > 0 && (
                      <strong>{selectedSubscribers.length} selected subscriber(s)</strong>
                    )}
                    {newsletterEmailType === 'all' && <strong>all {stats.activeCount} active subscribers</strong>}
                    {(!newsletterEmail && !newsletterCustomEmail && selectedSubscribers.length === 0 && newsletterEmailType !== 'all') && 'selected recipients'}
                    . Make sure the content is appropriate and follows email best practices.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleSendNewsletterCancel}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 transition-colors duration-200"
                  disabled={sendingNewsletter}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNewsletterConfirm}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                  disabled={sendingNewsletter || !newsletterSubject.trim() || !newsletterContent.trim() || 
                    (newsletterEmailType === 'subscriber' && !newsletterEmail) ||
                    (newsletterEmailType === 'custom' && !newsletterCustomEmail) ||
                    (newsletterEmailType === 'multiple' && selectedSubscribers.length === 0)}
                >
                  {sendingNewsletter ? 'Sending...' : 'Send Newsletter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create Email Template</h3>
                <button
                  onClick={() => {
                    setShowCreateTemplateModal(false);
                    resetTemplateForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      id="template-name"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <label htmlFor="template-type" className="block text-sm font-medium text-gray-700 mb-1">
                      Template Type *
                    </label>
                    <select
                      id="template-type"
                      value={templateForm.template_type}
                      onChange={(e) => setTemplateForm({...templateForm, template_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {templateTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="template-subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="template-subject"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email subject"
                  />
                </div>

                <div>
                  <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="template-description"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter template description"
                  />
                </div>


                <div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <strong>💡 Tip:</strong> Use the enhanced editor below to create beautiful emails with simple formatting hints. 
                      The HTML content will be generated automatically. Click the toggle buttons to show/hide different sections.
                    </p>
                  </div>
                  <EnhancedTextEditor
                    value={templateForm.plain_text_content}
                    onChange={handleTextContentChange}
                    placeholder="Enter your email content using the formatting guide below..."
                    showPreview={true}
                    showHelp={true}
                    variables={{
                      email: 'user@example.com',
                      name: 'John Doe',
                      company: 'Your Company',
                      website: window.location.origin,
                      login_url: `${window.location.origin}/login`,
                      unsubscribe_url: `${window.location.origin}/unsubscribe`,
                      support_email: 'support@yourstore.com',
                      shop_url: `${window.location.origin}/products`
                    }}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateForm.is_active}
                      onChange={(e) => setTemplateForm({...templateForm, is_active: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateForm.is_default}
                      onChange={(e) => setTemplateForm({...templateForm, is_default: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Default for this type</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateTemplateModal(false);
                    resetTemplateForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                  disabled={!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.html_content.trim()}
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
      <Footer />

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ isOpen: false, title: '', message: '' })}
        title={successDialog.title}
        message={successDialog.message}
      />

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, title: '', message: '', details: '' })}
        title={errorDialog.title}
        message={errorDialog.message}
        details={errorDialog.details}
      />
    </>
  );
};

export default NewsletterManagement;
