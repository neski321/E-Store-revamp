import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ErrorDialog from '../components/ErrorDialog';
import SuccessDialog from '../components/SuccessDialog';

const ReviewModeration = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    fetchPendingReviews();
  }, []);

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
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
      <Footer />
    </>
  );
};

export default ReviewModeration; 