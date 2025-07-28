import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthPromptModal from '../components/AuthPromptModal';

function Profile() {
  const { currentUser, updateProfile, getProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authPromptModal, setAuthPromptModal] = useState({ isOpen: false, actionType: 'profile' });
  
  const isLoggedIn = () => {
    return currentUser && !currentUser.isAnonymous;
  };

  // Refs for shipping and billing fields
  const shippingAddressLine1Ref = useRef();
  const shippingAddressLine2Ref = useRef();
  const shippingCityRef = useRef();
  const shippingStateRef = useRef();
  const shippingZipRef = useRef();
  const billingAddressLine1Ref = useRef();
  const billingAddressLine2Ref = useRef();
  const billingCityRef = useRef();
  const billingStateRef = useRef();
  const billingZipRef = useRef();

  useEffect(() => {
    if (!isLoggedIn()) {
      setAuthPromptModal({ isOpen: true, actionType: 'profile' });
      return;
    }

    async function loadProfile() {
      if (currentUser) {
        setLoading(true);
        const profile = await getProfile();
        if (profile) {
          // Populate refs with profile data 
          shippingAddressLine1Ref.current.value = profile.shippingAddressLine1 || '';
          shippingAddressLine2Ref.current.value = profile.shippingAddressLine2 || '';
          shippingCityRef.current.value = profile.shippingCity || '';
          shippingStateRef.current.value = profile.shippingState || '';
          shippingZipRef.current.value = profile.shippingZip || '';
          billingAddressLine1Ref.current.value = profile.billingAddressLine1 || '';
          billingAddressLine2Ref.current.value = profile.billingAddressLine2 || '';
          billingCityRef.current.value = profile.billingCity || '';
          billingStateRef.current.value = profile.billingState || '';
          billingZipRef.current.value = profile.billingZip || '';
        }
        setLoading(false);
      }
    }

    loadProfile();
  }, [currentUser, getProfile]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Update profile with billing and shipping information
      await updateProfile({
        shippingAddressLine1: shippingAddressLine1Ref.current.value,
        shippingAddressLine2: shippingAddressLine2Ref.current.value,
        shippingCity: shippingCityRef.current.value,
        shippingState: shippingStateRef.current.value,
        shippingZip: shippingZipRef.current.value,
        billingAddressLine1: billingAddressLine1Ref.current.value,
        billingAddressLine2: billingAddressLine2Ref.current.value,
        billingCity: billingCityRef.current.value,
        billingState: billingStateRef.current.value,
        billingZip: billingZipRef.current.value,
      });
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Failed to update profile');
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  }

  return (
    <>
      <Navbar />
      
      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authPromptModal.isOpen}
        onClose={() => setAuthPromptModal({ isOpen: false, actionType: 'profile' })}
        actionType={authPromptModal.actionType}
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">My Profile</h2>
          {message && <p className="text-center text-sm text-green-600">{message}</p>}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Billing Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Billing Information</h3>
                <div className="mb-4">
                  <label htmlFor="billing-address-line1" className="block text-gray-700">Billing Address Line 1</label>
                  <input type="text" id="billing-address-line1" ref={billingAddressLine1Ref} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label htmlFor="billing-address-line2" className="block text-gray-700">Billing Address Line 2</label>
                  <input type="text" id="billing-address-line2" ref={billingAddressLine2Ref} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label htmlFor="billing-city" className="block text-gray-700">City</label>
                  <input type="text" id="billing-city" ref={billingCityRef} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label htmlFor="billing-state" className="block text-gray-700">State/Province</label>
                  <input type="text" id="billing-state" ref={billingStateRef} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label htmlFor="billing-zip" className="block text-gray-700">Postal/Zip Code</label>
                  <input type="text" id="billing-zip" ref={billingZipRef} required className="w-full px-3 py-2 border rounded" />
                </div>
              </div>

              {/* Shipping Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
                <div className="mb-4">
                  <label htmlFor="shipping-address-line1" className="block text-gray-700">Shipping Address Line 1</label>
                  <input type="text" id="shipping-address-line1" ref={shippingAddressLine1Ref} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label htmlFor="shipping-address-line2" className="block text-gray-700">Shipping Address Line 2</label>
                  <input type="text" id="shipping-address-line2" ref={shippingAddressLine2Ref} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label htmlFor="shipping-city" className="block text-gray-700">City</label>
                  <input type="text" id="shipping-city" ref={shippingCityRef} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label htmlFor="shipping-state" className="block text-gray-700">State/Province</label>
                  <input type="text" id="shipping-state" ref={shippingStateRef} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label htmlFor="shipping-zip" className="block text-gray-700">Postal/Zip Code</label>
                  <input type="text" id="shipping-zip" ref={shippingZipRef} required className="w-full px-3 py-2 border rounded" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
