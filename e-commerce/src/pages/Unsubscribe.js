// src/pages/Unsubscribe.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NewsletterService from '../services/newsletterService';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [unsubscribeStatus, setUnsubscribeStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get email from URL parameters
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
    setIsLoading(false);
  }, [searchParams]);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setUnsubscribeStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    if (!NewsletterService.validateEmail(email)) {
      setUnsubscribeStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setIsUnsubscribing(true);
    setUnsubscribeStatus(null);
    setMessage('');

    try {
      await NewsletterService.unsubscribe(email);
      setUnsubscribeStatus('success');
      setMessage('You have been successfully unsubscribed from our newsletter. We\'re sorry to see you go!');
    } catch (error) {
      setUnsubscribeStatus('error');
      setMessage(error.message || 'Failed to unsubscribe. Please try again or contact support.');
    } finally {
      setIsUnsubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe from Newsletter</h1>
            <p className="text-gray-600">
              We're sorry to see you go! You can unsubscribe from our newsletter below.
            </p>
          </div>

          <form onSubmit={handleUnsubscribe} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter your email address"
                disabled={isUnsubscribing}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isUnsubscribing}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
            </button>

            {/* Status Messages */}
            {unsubscribeStatus && (
              <div className={`text-sm p-4 rounded-lg ${
                unsubscribeStatus === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {unsubscribeStatus === 'success' && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  You can always resubscribe anytime by visiting our website.
                </p>
                <Link 
                  to="/" 
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Return to Homepage
                </Link>
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Having trouble unsubscribing? Contact our support team.
              </p>
              <div className="flex justify-center space-x-4">
                <Link 
                  to="/contact" 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                >
                  Contact Support
                </Link>
                <Link 
                  to="/" 
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Unsubscribe;
