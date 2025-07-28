import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ErrorDialog from '../components/ErrorDialog';
import SuccessDialog from '../components/SuccessDialog';

const ReviewModeration = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [checkingServer, setCheckingServer] = useState(false);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const { currentUser, role } = useAuth();

  // Debug logging
  console.log('ReviewModeration - currentUser:', currentUser);
  console.log('ReviewModeration - role:', role);

  const isAdmin = () => {
    const adminCheck = currentUser && role === 'admin';
    console.log('ReviewModeration - isAdmin check:', adminCheck, 'currentUser:', !!currentUser, 'role:', role);
    return adminCheck;
  };

  // Track when role is loaded
  useEffect(() => {
    if (role !== '') {
      setRoleLoaded(true);
    }
  }, [role]);

  useEffect(() => {
    // Wait a bit for role to be loaded
    const timer = setTimeout(() => {
      fetchPendingReviews();
      checkServerStatus();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const checkServerStatus = async () => {
    try {
      setCheckingServer(true);
      const response = await fetch('https://e-commerce-6zf9.onrender.com/server-status/');
      if (response.ok) {
        const data = await response.json();
        setServerStatus(data.status);
      } else {
        setServerStatus('Error: Unable to fetch server status');
      }
    } catch (error) {
      setServerStatus('Error: Unable to fetch server status');
    } finally {
      setCheckingServer(false);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews/pending/');
      if (response.ok) {
        const data = await response.json();
        setPendingReviews(data);
      } else {
        throw new Error('Failed to fetch pending reviews');
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Error Loading Reviews',
        message: 'Failed to load pending reviews. Please try again.',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerateReview = async (reviewId, status) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/moderate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setSuccessDialog({
          isOpen: true,
          title: 'Review Moderated',
          message: `Review ${status} successfully`
        });
        // Remove the reviewed item from the list
        setPendingReviews(prev => prev.filter(review => review.id !== reviewId));
      } else {
        const errorData = await response.json();
        setErrorDialog({
          isOpen: true,
          title: 'Error Moderating Review',
          message: 'Failed to moderate review. Please try again.',
          details: errorData.detail || errorData.message || 'Unknown error'
        });
      }
    } catch (error) {
      console.error('Error moderating review:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Network Error',
        message: 'Failed to moderate review due to a network error. Please try again.',
        details: error.message
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show loading while role is being determined
  if (!roleLoaded) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin permissions...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {!isAdmin() ? (
        <div className="bg-gray-900 text-white min-h-screen">
          <div className="container mx-auto py-12 px-4 text-center">
            <h1 className="text-4xl font-bold mb-6">Access Denied</h1>
            <p className="text-xl mb-8">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-400 mb-4">Debug info: Role = {role}, User = {currentUser?.email}</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Server Status Section */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Server Status</h2>
                  <button
                    onClick={checkServerStatus}
                    disabled={checkingServer}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {checkingServer ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Status
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${serverStatus === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-700 font-medium">
                    {serverStatus === 'ok' ? 'Server is running normally' : serverStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Last checked: {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
                  <div className="text-sm text-gray-600">
                    {pendingReviews.length} pending review{pendingReviews.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Error Dialog */}
                <ErrorDialog
                  isOpen={errorDialog.isOpen}
                  onClose={() => setErrorDialog({ isOpen: false, title: '', message: '', details: '' })}
                  title={errorDialog.title}
                  message={errorDialog.message}
                  details={errorDialog.details}
                />

                {/* Success Dialog */}
                <SuccessDialog
                  isOpen={successDialog.isOpen}
                  onClose={() => setSuccessDialog({ isOpen: false, title: '', message: '' })}
                  title={successDialog.title}
                  message={successDialog.message}
                />

                {pendingReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Reviews</h3>
                    <p className="text-gray-600">All reviews have been moderated.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingReviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-gray-600">({review.rating}/5)</span>
                            </div>
                            <h3 className="font-medium text-gray-900">{review.reviewer_name}</h3>
                            <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleModerateReview(review.id, 'approved')}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleModerateReview(review.id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default ReviewModeration; 