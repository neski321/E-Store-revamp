import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SuccessDialog from './SuccessDialog';
import ErrorDialog from './ErrorDialog';

const API_URL = process.env.REACT_APP_API_URL || '';

const ProductReviews = ({ productId, reviews = [], onReviewAdded }) => {
  const [localReviews, setLocalReviews] = useState(reviews);
  const [newReview, setNewReview] = useState({ 
    rating: 5, 
    comment: '', 
    reviewer_name: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editReview, setEditReview] = useState({ rating: 5, comment: '' });
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });
  const { currentUser, role } = useAuth();

  // Update local reviews when props change
  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorDialog({
        isOpen: true,
        title: 'Login Required',
        message: 'Please log in to submit a review.',
        details: ''
      });
      return;
    }

    // Validate required fields
    if (!newReview.reviewer_name.trim() || !newReview.comment.trim()) {
      setErrorDialog({
        isOpen: true,
        title: 'Missing Information',
        message: 'Please fill in all required fields before submitting your review.',
        details: ''
      });
      return;
    }

    try {
      setSubmitting(true);
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add user info to headers if available
      if (currentUser) {
        headers['X-User-ID'] = currentUser.uid;
        headers['X-User-Email'] = currentUser.email;
        headers['X-User-Role'] = role || 'user';
      }
      
      const response = await fetch(`${API_URL}/products/${productId}/reviews/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        setNewReview({ rating: 5, comment: '', reviewer_name: '' });
        setSuccessDialog({
          isOpen: true,
          title: 'Review Submitted! ⭐',
          message: 'Thank you for your review. It has been successfully submitted.'
        });
        // Notify parent component to refresh product data
        if (onReviewAdded) {
          onReviewAdded();
        } else {
          // Fallback to page reload
          window.location.reload();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorDialog({
          isOpen: true,
          title: 'Failed to Submit Review',
          message: 'There was an error submitting your review. Please try again.',
          details: errorData.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        details: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review.id);
    setEditReview({ rating: review.rating, comment: review.comment });
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    try {
      setSubmitting(true);
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add user info to headers if available
      if (currentUser) {
        headers['X-User-ID'] = currentUser.uid;
        headers['X-User-Email'] = currentUser.email;
        headers['X-User-Role'] = role || 'user';
      }
      
      const response = await fetch(`${API_URL}/products/${productId}/reviews/${editingReview}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editReview),
      });

      if (response.ok) {
        setEditingReview(null);
        setEditReview({ rating: 5, comment: '' });
        setSuccessDialog({
          isOpen: true,
          title: 'Review Updated! ✏️',
          message: 'Your review has been successfully updated.'
        });
        if (onReviewAdded) {
          onReviewAdded();
        } else {
          window.location.reload();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorDialog({
          isOpen: true,
          title: 'Failed to Update Review',
          message: 'There was an error updating your review. Please try again.',
          details: errorData.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        details: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    // Find the review to check if it's the user's own review
    const review = localReviews.find(r => r.id === reviewId);
    const isOwnReview = isUserReview(review);
    
    // Show confirmation dialog with different messages for admin vs user
    setErrorDialog({
      isOpen: true,
      title: 'Delete Review',
      message: isAdmin() && !isOwnReview 
        ? 'Are you sure you want to delete this review as an admin? This action cannot be undone.'
        : 'Are you sure you want to delete your review? This action cannot be undone.',
      details: '',
      isConfirmation: true,
      onConfirm: async () => {
        try {
          setSubmitting(true);
          const headers = {};
          
          // Add user info to headers if available
          if (currentUser) {
            headers['X-User-ID'] = currentUser.uid;
            headers['X-User-Email'] = currentUser.email;
        headers['X-User-Role'] = role || 'user';
          }
          
          const response = await fetch(`${API_URL}/products/${productId}/reviews/${reviewId}/`, {
            method: 'DELETE',
            headers,
          });

          if (response.ok) {
            setSuccessDialog({
              isOpen: true,
              title: 'Review Deleted! 🗑️',
              message: isAdmin() && !isOwnReview 
                ? 'The review has been successfully deleted by admin.'
                : 'Your review has been successfully deleted.'
            });
            if (onReviewAdded) {
              onReviewAdded();
            } else {
              window.location.reload();
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            setErrorDialog({
              isOpen: true,
              title: 'Failed to Delete Review',
              message: 'There was an error deleting your review. Please try again.',
              details: errorData.error || 'Unknown error occurred'
            });
          }
        } catch (error) {
          console.error('Error deleting review:', error);
          setErrorDialog({
            isOpen: true,
            title: 'Network Error',
            message: 'Unable to connect to the server. Please check your internet connection and try again.',
            details: error.message
          });
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const isUserReview = (review) => {
    return currentUser && review.reviewer_id === currentUser.uid;
  };

  const canEditReview = (review) => {
    // Only the review author can edit their review
    return isUserReview(review);
  };

  const canDeleteReview = (review) => {
    // Admin can delete any review, or user can delete their own review
    return (role === 'admin') || isUserReview(review);
  };

  const isAdmin = () => {
    return role === 'admin';
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



  return (
    <div className="mt-8">
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
        isConfirmation={errorDialog.isConfirmation}
        onConfirm={errorDialog.onConfirm}
      />

      <h3 className="text-lg font-semibold mb-4">Reviews</h3>
      
      {/* Submit Review Form */}
      {currentUser && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Write a Review</h4>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-6 h-6 ${
                        star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={newReview.reviewer_name}
                onChange={(e) => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {localReviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        ) : (
          localReviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              {editingReview === review.id ? (
                // Edit Review Form
                <form onSubmit={handleUpdateReview} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditReview({ ...editReview, rating: star })}
                          className="focus:outline-none"
                        >
                          <svg
                            className={`w-6 h-6 ${
                              star <= editReview.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment
                    </label>
                    <textarea
                      value={editReview.comment}
                      onChange={(e) => setEditReview({ ...editReview, comment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {submitting ? 'Updating...' : 'Update Review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingReview(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Review Display
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      {(canEditReview(review) || canDeleteReview(review)) && (
                        <div className="flex space-x-2">
                          {canEditReview(review) && (
                            <button
                              onClick={() => handleEditReview(review)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="Edit review"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          {canDeleteReview(review) && (
                            <div className="relative group">
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                title={isAdmin() && !isUserReview(review) ? "Delete review (Admin)" : "Delete review"}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              {isAdmin() && !isUserReview(review) && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full border border-white"></div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  <p className="text-sm text-gray-500 mt-2">- {review.reviewer_name}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews; 