// src/pages/NewsletterManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NewsletterService from '../services/newsletterService';

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
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [newsletterIsHtml, setNewsletterIsHtml] = useState(true);

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

  useEffect(() => {
    // Wait for auth to load before checking permissions
    if (authLoading) {
      return;
    }
    
    // Check if user is admin before fetching subscribers
    if (currentUser && role === 'admin') {
      fetchSubscribers();
    } else if (currentUser && role !== 'admin') {
      setError('Admin access required to view newsletter subscribers');
      setLoading(false);
    } else if (!currentUser) {
      setError('Please log in to access this page');
      setLoading(false);
    }
  }, [fetchSubscribers, currentUser, role, authLoading]);

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
    setNewsletterEmail(email);
    setNewsletterSubject('');
    setNewsletterContent('');
    setNewsletterIsHtml(true);
    setShowNewsletterModal(true);
  };

  const handleSendNewsletterConfirm = async () => {
    try {
      setSendingNewsletter(true);
      setError('');
      
      await NewsletterService.sendNewsletterToSubscriber(
        newsletterEmail, 
        newsletterSubject, 
        newsletterContent, 
        newsletterIsHtml, 
        currentUser, 
        role
      );
      
      setShowNewsletterModal(false);
      setNewsletterEmail('');
      setNewsletterSubject('');
      setNewsletterContent('');
    } catch (err) {
      setError(err.message || 'Failed to send newsletter');
      console.error('Error sending newsletter:', err);
    } finally {
      setSendingNewsletter(false);
    }
  };

  const handleSendNewsletterCancel = () => {
    setShowNewsletterModal(false);
    setNewsletterEmail('');
    setNewsletterSubject('');
    setNewsletterContent('');
  };

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Newsletter Management</h1>
              <div className="flex space-x-4">
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unsubscribed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subscriber.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscriber.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscriber.subscribed_at ? formatDate(subscriber.subscribed_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscriber.unsubscribed_at ? formatDate(subscriber.unsubscribed_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscriber.subscription_source || 'footer'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscriber.user_id || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {subscriber.is_active ? (
                            <>
                              <button
                                onClick={() => handleSendNewsletterClick(subscriber.email)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors duration-200"
                                disabled={sendingNewsletter}
                              >
                                Send Newsletter
                              </button>
                              <button
                                onClick={() => handleUnsubscribeClick(subscriber.email)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors duration-200"
                                disabled={unsubscribing}
                              >
                                Unsubscribe
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">Already unsubscribed</span>
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
                <h3 className="text-lg font-medium text-gray-900">Send Newsletter to {newsletterEmail}</h3>
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
                    disabled={sendingNewsletter}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter newsletter content (HTML supported)"
                    disabled={sendingNewsletter}
                  />
                </div>

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
                    <strong>Note:</strong> This newsletter will be sent only to <strong>{newsletterEmail}</strong>. 
                    Make sure the content is appropriate and follows email best practices.
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
                  disabled={sendingNewsletter || !newsletterSubject.trim() || !newsletterContent.trim()}
                >
                  {sendingNewsletter ? 'Sending...' : 'Send Newsletter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default NewsletterManagement;
