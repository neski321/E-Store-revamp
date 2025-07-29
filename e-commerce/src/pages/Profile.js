import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, updateEmail, updatePassword } from 'firebase/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthPromptModal from '../components/AuthPromptModal';

function Profile() {
  const { currentUser, updateProfile, getProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authPromptModal, setAuthPromptModal] = useState({ isOpen: false, actionType: 'profile' });
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Form state to persist data across tab switches
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    shippingAddressLine1: '',
    shippingAddressLine2: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'US',
    billingAddressLine1: '',
    billingAddressLine2: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'US',
    // Account settings fields
    newEmail: '',
    confirmPassword: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const isLoggedIn = useCallback(() => {
    return currentUser && !currentUser.isAnonymous;
  }, [currentUser]);

  // Load profile data function
  const loadProfile = useCallback(async () => {
    if (currentUser) {
      setLoading(true);
      try {
        console.log('Loading profile for user:', currentUser.uid);
        const profile = await getProfile();
        console.log('Profile data loaded:', profile);
        
        if (profile) {
          // Update form data with profile information
          setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || currentUser.email || '',
            phone: profile.phone || '',
            dateOfBirth: profile.dateOfBirth || '',
            shippingAddressLine1: profile.shippingAddressLine1 || '',
            shippingAddressLine2: profile.shippingAddressLine2 || '',
            shippingCity: profile.shippingCity || '',
            shippingState: profile.shippingState || '',
            shippingZip: profile.shippingZip || '',
            shippingCountry: profile.shippingCountry || 'US',
            billingAddressLine1: profile.billingAddressLine1 || '',
            billingAddressLine2: profile.billingAddressLine2 || '',
            billingCity: profile.billingCity || '',
            billingState: profile.billingState || '',
            billingZip: profile.billingZip || '',
            billingCountry: profile.billingCountry || 'US'
          });
          
          // Check if billing and shipping are the same
          const isSameAddress = profile.shippingAddressLine1 === profile.billingAddressLine1 &&
            profile.shippingCity === profile.billingCity &&
            profile.shippingState === profile.billingState &&
            profile.shippingZip === profile.billingZip;
          
          setSameAsBilling(isSameAddress);
          console.log('Profile loaded successfully. Same as billing:', isSameAddress);
          setMessage('Profile data loaded successfully!');
          setTimeout(() => setMessage(''), 3000);
        } else {
          console.log('No profile data found, starting with empty form');
          setMessage('No saved profile data found. Fill out the form to create your profile.');
          setTimeout(() => setMessage(''), 5000);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }
  }, [currentUser, getProfile]);

  useEffect(() => {
    if (!isLoggedIn()) {
      return;
    }

    console.log('Current user:', currentUser);
    console.log('User UID:', currentUser?.uid);
    console.log('User email:', currentUser?.email);

    loadProfile();
  }, [currentUser, isLoggedIn, loadProfile]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle same as billing checkbox
  const handleSameAsBilling = (checked) => {
    setSameAsBilling(checked);
    if (checked) {
      // Copy billing information to shipping
      setFormData(prev => ({
        ...prev,
        shippingAddressLine1: prev.billingAddressLine1,
        shippingAddressLine2: prev.billingAddressLine2,
        shippingCity: prev.billingCity,
        shippingState: prev.billingState,
        shippingZip: prev.billingZip,
        shippingCountry: prev.billingCountry
      }));
    }
  };

  // Handle billing information changes
  const handleBillingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (sameAsBilling) {
      // Update shipping information when billing changes and checkbox is checked
      const shippingField = field.replace('billing', 'shipping');
      setFormData(prev => ({
        ...prev,
        [shippingField]: value
      }));
    }
  };

    async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Update profile with all information
      await updateProfile({
        ...formData,
        sameAsBilling: sameAsBilling,
        updatedAt: new Date().toISOString()
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  }

  // Handle change email
  const handleChangeEmail = async () => {
    if (!formData.newEmail || !formData.confirmPassword) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (formData.newEmail === currentUser.email) {
      setMessage('New email must be different from current email');
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate user with current password
      await signInWithEmailAndPassword(auth, currentUser.email, formData.confirmPassword);
      
      // Update email
      await updateEmail(auth.currentUser, formData.newEmail);
      
      // Update profile in Firestore
      await updateProfile({
        email: formData.newEmail,
        updatedAt: new Date().toISOString()
      });

      // Clear form fields
      setFormData(prev => ({
        ...prev,
        newEmail: '',
        confirmPassword: ''
      }));

      setMessage('Email address updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating email:', error);
      if (error.code === 'auth/wrong-password') {
        setMessage('Current password is incorrect');
      } else if (error.code === 'auth/email-already-in-use') {
        setMessage('Email address is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setMessage('Invalid email address');
      } else {
        setMessage('Failed to update email address');
      }
    }
    setLoading(false);
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate user with current password
      await signInWithEmailAndPassword(auth, currentUser.email, formData.currentPassword);
      
      // Update password
      await updatePassword(auth.currentUser, formData.newPassword);
      
      // Clear form fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));

      setMessage('Password updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        setMessage('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setMessage('Password is too weak');
      } else {
        setMessage('Failed to update password');
      }
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'personal', name: 'Personal Information', icon: '👤' },
    { id: 'shipping', name: 'Shipping Address', icon: '📦' },
    { id: 'billing', name: 'Billing Address', icon: '💳' },
    { id: 'account', name: 'Account Settings', icon: '⚙️' }
  ];

  return (
    <>
      <Navbar />
      
      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authPromptModal.isOpen}
        onClose={() => setAuthPromptModal({ isOpen: false, actionType: 'profile' })}
        actionType={authPromptModal.actionType}
      />

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and addresses</p>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className={`mb-6 p-4 border rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-center ${
                message.includes('successfully') ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-800">Loading profile data...</p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shipping-address-line1" className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      id="shipping-address-line1"
                      value={formData.shippingAddressLine1}
                      onChange={(e) => handleInputChange('shippingAddressLine1', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="shipping-address-line2" className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id="shipping-address-line2"
                      value={formData.shippingAddressLine2}
                      onChange={(e) => handleInputChange('shippingAddressLine2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="shipping-city"
                        value={formData.shippingCity}
                        onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-state" className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        id="shipping-state"
                        value={formData.shippingState}
                        onChange={(e) => handleInputChange('shippingState', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-zip" className="block text-sm font-medium text-gray-700 mb-2">
                        Postal/Zip Code *
                      </label>
                      <input
                        type="text"
                        id="shipping-zip"
                        value={formData.shippingZip}
                        onChange={(e) => handleInputChange('shippingZip', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="shipping-country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      id="shipping-country"
                      value={formData.shippingCountry}
                      onChange={(e) => handleInputChange('shippingCountry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Address Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing Address</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="billing-address-line1" className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      id="billing-address-line1"
                      value={formData.billingAddressLine1}
                      onChange={(e) => handleBillingChange('billingAddressLine1', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="billing-address-line2" className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id="billing-address-line2"
                      value={formData.billingAddressLine2}
                      onChange={(e) => handleBillingChange('billingAddressLine2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="billing-city"
                        value={formData.billingCity}
                        onChange={(e) => handleBillingChange('billingCity', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="billing-state" className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        id="billing-state"
                        value={formData.billingState}
                        onChange={(e) => handleBillingChange('billingState', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="billing-zip" className="block text-sm font-medium text-gray-700 mb-2">
                        Postal/Zip Code *
                      </label>
                      <input
                        type="text"
                        id="billing-zip"
                        value={formData.billingZip}
                        onChange={(e) => handleBillingChange('billingZip', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="billing-country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      id="billing-country"
                      value={formData.billingCountry}
                      onChange={(e) => handleBillingChange('billingCountry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>

                {/* Same as Billing Checkbox */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => handleSameAsBilling(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Use same address for shipping and billing
                    </span>
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    When checked, your shipping address will automatically match your billing address
                  </p>
                </div>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
                <div className="space-y-6">
                  {/* Account Information */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Account Information</h4>
                    <p className="text-sm text-blue-700">
                      Email: {currentUser?.email || 'Not available'}
                    </p>
                    <p className="text-sm text-blue-700">
                      Account Type: {currentUser?.isAnonymous ? 'Guest' : 'Registered User'}
                    </p>
                  </div>

                  {/* Change Email Section */}
                  {!currentUser?.isAnonymous && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-3">Change Email Address</h4>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            New Email Address
                          </label>
                          <input
                            type="email"
                            id="newEmail"
                            value={formData.newEmail || ''}
                            onChange={(e) => handleInputChange('newEmail', e.target.value)}
                            placeholder="Enter new email address"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword || ''}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Enter current password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleChangeEmail}
                          disabled={loading}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {loading ? 'Updating...' : 'Update Email Address'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reset Password Section */}
                  {!currentUser?.isAnonymous && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-3">Reset Password</h4>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            value={formData.currentPassword || ''}
                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                            placeholder="Enter current password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            value={formData.newPassword || ''}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmNewPassword"
                            value={formData.confirmNewPassword || ''}
                            onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleResetPassword}
                          disabled={loading}
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {loading ? 'Updating...' : 'Reset Password'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Privacy & Security */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Privacy & Security</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Your personal information is securely stored and will only be used for order processing and customer service.
                    </p>
                    <button
                      type="button"
                      className="text-sm text-yellow-800 underline hover:no-underline"
                    >
                      View Privacy Policy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
