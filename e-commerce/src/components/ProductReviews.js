import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ErrorDialog from './ErrorDialog';
import SuccessDialog from './SuccessDialog';
import AuthPromptModal from './AuthPromptModal';

const ProductReviews = ({ productId, productTitle }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    reviewer_name: '',
    reviewer_email: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [minRating, setMinRating] = useState('');
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [authPromptModal, setAuthPromptModal] = useState({ isOpen: false, actionType: 'reviews' });
  const { currentUser } = useAuth();

  const isGuestUser = () => {
    return currentUser && currentUser.isAnonymous;
  };

  const isLoggedIn = () => {
    return currentUser && !currentUser.isAnonymous;
  };

  const handleWriteReviewClick = () => {
    if (!isLoggedIn()) {
      setAuthPromptModal({ isOpen: true, actionType: 'reviews' });
      return;
    }
    setShowReviewForm(true);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, sortOrder, minRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort: sortBy,
        order: sortOrder
      });
      
      if (minRating) {
        params.append('min_rating', minRating);
      }

      const response = await fetch(`/api/products/${productId}/reviews/?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Error Loading Reviews',
        message: 'Failed to load reviews. Please try again.',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!newReview.reviewer_name || !newReview.comment) {
      setErrorDialog({
        isOpen: true,
        title: 'Missing Information',
        message: 'Please fill in all required fields (name and review).',
        details: ''
      });
      return;
    }

    try {
      const reviewData = {
        rating: parseInt(newReview.rating),
        comment: newReview.comment,
        reviewer_name: newReview.reviewer_name,
        reviewer_email: currentUser?.email || newReview.reviewer_email,
        reviewer_id: currentUser?.uid || null,
        status: 'pending'
      };

      const response = await fetch(`/api/products/${productId}/add_review/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const savedReview = await response.json();
        // Refresh the reviews list to show the new review
        fetchReviews();
        setNewReview({
          rating: 5,
          comment: '',
          reviewer_name: '',
          reviewer_email: ''
        });
        setShowReviewForm(false);
        setSuccessDialog({
          isOpen: true,
          title: 'Review Submitted',
          message: 'Your review has been submitted successfully! It will be visible after approval.'
        });
      } else {
        const errorData = await response.json();
        setErrorDialog({
          isOpen: true,
          title: 'Error Submitting Review',
          message: 'Failed to submit your review. Please try again.',
          details: errorData.detail || errorData.message || 'Unknown error'
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Network Error',
        message: 'Failed to submit review due to a network error. Please check your connection and try again.',
        details: error.message
      });
    }
  };

  const handleVoteReview = async (reviewId, isHelpful) => {
    try {
      const response = await fetch(`/api/products/${productId}/vote_review/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review_id: reviewId,
          is_helpful: isHelpful
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setReviews(reviews.map(review => 
          review.id === reviewId 
            ? { ...review, helpful_votes: result.helpful_votes, total_votes: result.total_votes }
            : review
        ));
      } else {
        const errorData = await response.json();
        setErrorDialog({
          isOpen: true,
          title: 'Error Voting',
          message: 'Failed to vote on this review. Please try again.',
          details: errorData.detail || 'Unknown error'
        });
      }
    } catch (error) {
      console.error('Error voting on review:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Network Error',
        message: 'Failed to vote due to a network error. Please try again.',
        details: error.message
      });
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
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

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authPromptModal.isOpen}
        onClose={() => setAuthPromptModal({ isOpen: false, actionType: 'reviews' })}
        actionType={authPromptModal.actionType}
      />

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
        <button
          onClick={handleWriteReviewClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && isLoggedIn() && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Write Your Review</h4>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-6 h-6 ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
              <input
                type="text"
                value={newReview.reviewer_name}
                onChange={(e) => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Review *</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your experience with this product..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="rating-asc">Lowest Rated</option>
            <option value="helpful_votes-desc">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-600">({review.rating}/5)</span>
                  </div>
                  <h4 className="font-medium text-gray-900">{review.reviewer_name}</h4>
                  <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
                </div>
                {review.is_verified_purchase && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified Purchase
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-4">{review.comment}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVoteReview(review.id, true)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>Helpful ({review.helpful_votes})</span>
                  </button>
                  
                  <button
                    onClick={() => handleVoteReview(review.id, false)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2" />
                    </svg>
                    <span>Not Helpful ({review.total_votes - review.helpful_votes})</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews; 