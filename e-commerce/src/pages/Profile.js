import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, updateEmail, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, doc, getDoc, writeBatch } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthPromptModal from '../components/AuthPromptModal';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

function Profile() {
  const { currentUser, updateUserProfile, getProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authPromptModal, setAuthPromptModal] = useState({ isOpen: false, actionType: 'profile' });
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [adminRequestStatus, setAdminRequestStatus] = useState(null); // null, 'pending', 'approved', 'rejected'
  const [userRole, setUserRole] = useState('user');
  const [adminRequest, setAdminRequest] = useState(null);
  const [cooldownEndTime, setCooldownEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  
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

  // Handle profile picture update
  const handleProfilePictureUpdate = (newPictureUrl) => {
    setProfilePicture(newPictureUrl);
  };

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

          // Set profile picture
          setProfilePicture(profile.profilePicture || null);
          
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
      await updateUserProfile({
        ...formData,
        sameAsBilling: sameAsBilling,
        updatedAt: new Date().toISOString()
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
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
      await updateUserProfile({
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
    } finally {
      setLoading(false);
    }
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
    } finally {
      setLoading(false);
    }
  };

  // Calculate time remaining for cooldown
  const calculateTimeRemaining = useCallback((endTime) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;
    
    if (difference <= 0) {
      return null; // Cooldown period has ended
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, total: difference };
  }, []);

  // Check if user can submit a new request (cooldown period check)
  const canSubmitNewRequest = useCallback(() => {
    if (!cooldownEndTime) return true;
    const remaining = calculateTimeRemaining(cooldownEndTime);
    return remaining === null;
  }, [cooldownEndTime, calculateTimeRemaining]);

  // Check admin request status and user role
  const checkAdminRequestStatus = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Get user's current role
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role || 'user');
      }
      
      // Get admin request status
      const requestsRef = collection(db, 'adminRequests');
      const q = query(requestsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const latestRequest = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))[0];
        
        setAdminRequest(latestRequest);
        setAdminRequestStatus(latestRequest.status);
        console.log('Admin request data:', latestRequest);
        console.log('Admin note:', latestRequest.adminNote);
        
        // Calculate cooldown end time (1 week from when request was processed)
        if (latestRequest.status === 'rejected' || latestRequest.status === 'revoked') {
          const processedAt = latestRequest.processedAt || latestRequest.requestedAt;
          const cooldownEnd = new Date(processedAt);
          cooldownEnd.setDate(cooldownEnd.getDate() + 7); // Add 7 days
          setCooldownEndTime(cooldownEnd.toISOString());
        } else {
          setCooldownEndTime(null);
        }
      } else {
        setAdminRequest(null);
        setAdminRequestStatus(null);
        setCooldownEndTime(null);
      }
    } catch (error) {
      console.error('Error checking admin request status:', error);
    }
  }, [currentUser]);

  // Request admin access
  const handleRequestAdminAccess = async () => {
    if (!currentUser) return;
    
    // Check if user has filled out first name and last name
    if (!formData.firstName || !formData.lastName || formData.firstName.trim() === '' || formData.lastName.trim() === '') {
      setMessage('Please fill out your first name and last name in Personal Information before requesting admin access');
      setTimeout(() => setMessage(''), 5000);
      // Switch to personal information tab
      setActiveTab('personal');
      return;
    }
    
    // Check cooldown period
    if (!canSubmitNewRequest()) {
      const remaining = calculateTimeRemaining(cooldownEndTime);
      if (remaining) {
        setMessage(`You can submit a new request in ${remaining.days}d ${remaining.hours}h ${remaining.minutes}m`);
        setTimeout(() => setMessage(''), 5000);
        return;
      }
    }
    
    try {
      setLoading(true);
      
      // Check if user already has a pending request
      const requestsRef = collection(db, 'adminRequests');
      const q = query(requestsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const latestRequest = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))[0];
        
        if (latestRequest.status === 'pending') {
          setMessage('You have a pending admin request');
          setTimeout(() => setMessage(''), 3000);
          return;
        }
      }
      
      // Create new admin request
      await addDoc(requestsRef, {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: `${formData.firstName} ${formData.lastName}`.trim() || 'Unknown User',
        status: 'pending',
        requestedAt: new Date().toISOString(),
        reason: 'User requested admin access through profile settings'
      });
      
      setAdminRequestStatus('pending');
      setMessage('Admin access request submitted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error requesting admin access:', error);
      setMessage('Failed to submit admin request');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Load admin request status on component mount
  useEffect(() => {
    checkAdminRequestStatus();
  }, [checkAdminRequestStatus]);

  // Safety timeout to reset loading state if it gets stuck
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('Loading state timeout - resetting loading state');
        setLoading(false);
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Update time remaining every second when in cooldown
  useEffect(() => {
    if (!cooldownEndTime) {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const remaining = calculateTimeRemaining(cooldownEndTime);
      setTimeRemaining(remaining);
    };

    // Update immediately
    updateTimeRemaining();

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [cooldownEndTime, calculateTimeRemaining]);

  // Delete all user data from Firestore
  const deleteUserDataFromFirestore = useCallback(async (userId) => {
    const batch = writeBatch(db);
    
    try {
      // Delete user document
      const userRef = doc(db, 'users', userId);
      batch.delete(userRef);
      
      // Delete user's orders
      const ordersRef = collection(db, 'users', userId, 'orders');
      const ordersQuery = query(ordersRef);
      const ordersSnapshot = await getDocs(ordersQuery);
      ordersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete user's favorites
      const favoritesRef = collection(db, 'users', userId, 'favorites');
      const favoritesQuery = query(favoritesRef);
      const favoritesSnapshot = await getDocs(favoritesQuery);
      favoritesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete user's checkout data
      const checkoutRef = doc(db, 'checkout', userId);
      batch.delete(checkoutRef);
      
      // Delete user's checkout items
      const checkoutItemsRef = collection(db, 'checkout', userId, 'items');
      const checkoutItemsQuery = query(checkoutItemsRef);
      const checkoutItemsSnapshot = await getDocs(checkoutItemsQuery);
      checkoutItemsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete user's contact messages
      const contactMessagesRef = collection(db, 'contactMessages', userId, 'messages');
      const contactMessagesQuery = query(contactMessagesRef);
      const contactMessagesSnapshot = await getDocs(contactMessagesQuery);
      contactMessagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete user's contact messages folder (top-level document)
      const contactMessagesFolderRef = doc(db, 'contactMessages', userId);
      batch.delete(contactMessagesFolderRef);
      
      // Delete user's admin requests
      const adminRequestsRef = collection(db, 'adminRequests');
      const adminRequestsQuery = query(adminRequestsRef, where('userId', '==', userId));
      const adminRequestsSnapshot = await getDocs(adminRequestsQuery);
      adminRequestsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Commit all deletions
      await batch.commit();
      console.log('All user data deleted from Firestore');
    } catch (error) {
      console.error('Error deleting user data from Firestore:', error);
      throw error;
    }
  }, []);

  // Clear delete error
  const clearDeleteError = () => {
    setDeleteError(null);
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    // Clear any previous errors
    setDeleteError(null);
    
    // Validate confirmation text
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError({
        title: 'Invalid Confirmation',
        message: 'Please type "DELETE" exactly to confirm account deletion.',
        details: `You typed: "${deleteConfirmText}"`
      });
      return;
    }
    
    if (!deletePassword) {
      setDeleteError({
        title: 'Password Required',
        message: 'Please enter your current password to confirm account deletion.',
        details: 'This is required for security verification.'
      });
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Delete all user data from Firestore
      await deleteUserDataFromFirestore(currentUser.uid);
      
      // Delete Firebase Auth account
      await deleteUser(currentUser);
      
      // Success - user will be automatically signed out and redirected
      setMessage('Account deleted successfully');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        setDeleteError({
          title: 'Incorrect Password',
          message: 'The password you entered is incorrect.',
          details: 'Please check your password and try again. Make sure Caps Lock is not enabled.'
        });
      } else if (error.code === 'auth/too-many-requests') {
        setDeleteError({
          title: 'Too Many Attempts',
          message: 'You have made too many failed attempts.',
          details: 'Please wait a few minutes before trying again.'
        });
      } else if (error.code === 'auth/user-not-found') {
        setDeleteError({
          title: 'Account Not Found',
          message: 'Your account could not be found.',
          details: 'Please refresh the page and try again.'
        });
      } else if (error.code === 'auth/network-request-failed') {
        setDeleteError({
          title: 'Network Error',
          message: 'Unable to connect to the server.',
          details: 'Please check your internet connection and try again.'
        });
      } else {
        setDeleteError({
          title: 'Deletion Failed',
          message: 'Failed to delete your account.',
          details: error.message || 'Please try again later or contact support if the problem persists.'
        });
      }
    } finally {
      setIsDeleting(false);
    }
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
                
                {/* Profile Picture Section */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Profile Picture</h4>
                  <ProfilePictureUpload
                    currentProfilePicture={profilePicture}
                    onPictureUpdate={handleProfilePictureUpdate}
                    size="w-32 h-32"
                  />
                </div>
                
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

                  {/* Admin Access Request - Only show for non-admin users */}
                  {!currentUser?.isAnonymous && userRole !== 'admin' && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <h4 className="font-medium text-indigo-900 mb-3">Admin Access Management</h4>
                      
                      {/* Current Role Status */}
                      <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-blue-800">
                              Current Role: <span className="font-bold capitalize">{userRole}</span>
                            </span>
                          </div>
                          {userRole === 'admin' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              ✓ Admin Access Active
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {userRole === 'user' && (
                        <>
                          <p className="text-sm text-indigo-700 mb-4">
                            Request admin access to manage products, orders, and other administrative functions.
                          </p>
                          
                          {adminRequestStatus === null && (
                            <div>
                              {/* Personal Information Requirement Warning */}
                              {(!formData.firstName || !formData.lastName || formData.firstName.trim() === '' || formData.lastName.trim() === '') && (
                                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">Personal Information Required</span>
                                  </div>
                                  <p className="mt-1">
                                    Please complete your first name and last name in the Personal Information tab before requesting admin access.
                                  </p>
                                </div>
                              )}
                              
                              <button
                                type="button"
                                onClick={handleRequestAdminAccess}
                                disabled={loading || !formData.firstName || !formData.lastName || formData.firstName.trim() === '' || formData.lastName.trim() === ''}
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              >
                                {loading ? 'Submitting...' : 'Request Admin Access'}
                              </button>
                            </div>
                          )}
                          
                          {adminRequestStatus === 'pending' && (
                            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-yellow-800">Waiting on decision</span>
                              </div>
                              <p className="text-xs text-yellow-700 mt-1">
                                Your admin access request is being reviewed by administrators. Please wait for a decision.
                                {adminRequest?.requestedAt && (
                                  <span className="block mt-1">
                                    Requested: {new Date(adminRequest.requestedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                <strong>Note:</strong> You cannot submit another request while this one is pending review.
                              </div>
                            </div>
                          )}
                          
                          {adminRequestStatus === 'rejected' && (
                            <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-red-800">Admin request denied</span>
                              </div>
                              <p className="text-xs text-red-700 mt-1">
                                Your admin access request has been denied. You can submit a new request after a 1-week cooldown period.
                                {adminRequest?.processedAt && (
                                  <span className="block mt-1">
                                    Denied: {new Date(adminRequest.processedAt).toLocaleDateString()}
                                  </span>
                                )}
                                {adminRequest?.adminNote && adminRequest.adminNote.trim() !== '' && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                    <div className="flex items-start">
                                      <svg className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                      </svg>
                                      <div>
                                        <span className="font-medium text-red-800">Reason:</span>
                                        <p className="text-red-700 mt-1">{adminRequest.adminNote}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </p>
                              
                              {/* Cooldown Status */}
                              {timeRemaining ? (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">Cooldown Period Active</span>
                                  </div>
                                  <p className="mt-1">
                                    You can submit a new request in: <span className="font-bold">{timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s</span>
                                  </p>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleRequestAdminAccess}
                                  disabled={loading}
                                  className="mt-2 w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                  {loading ? 'Submitting...' : 'Submit New Request'}
                                </button>
                              )}
                            </div>
                          )}
                          
                          {adminRequestStatus === 'revoked' && (
                            <div className="p-3 bg-orange-100 border border-orange-300 rounded-md">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-orange-800">Admin access revoked</span>
                              </div>
                              <p className="text-xs text-orange-700 mt-1">
                                Your admin access has been revoked by an administrator. You can request access again after a 1-week cooldown period.
                                {adminRequest?.processedAt && (
                                  <span className="block mt-1">
                                    Revoked: {new Date(adminRequest.processedAt).toLocaleDateString()}
                                  </span>
                                )}
                                {adminRequest?.adminNote && adminRequest.adminNote.trim() !== '' && (
                                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                    <div className="flex items-start">
                                      <svg className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                      </svg>
                                      <div>
                                        <span className="font-medium text-orange-800">Reason:</span>
                                        <p className="text-orange-700 mt-1">{adminRequest.adminNote}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </p>
                              
                              {/* Cooldown Status */}
                              {timeRemaining ? (
                                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">Cooldown Period Active</span>
                                  </div>
                                  <p className="mt-1">
                                    You can submit a new request in: <span className="font-bold">{timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s</span>
                                  </p>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleRequestAdminAccess}
                                  disabled={loading}
                                  className="mt-2 w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                  {loading ? 'Submitting...' : 'Request Access Again'}
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      
                    </div>
                  )}

                  {/* Admin Status - Only show for admin users */}
                  {!currentUser?.isAnonymous && userRole === 'admin' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-3">Admin Status</h4>
                      
                      <div className="p-3 bg-green-100 border border-green-300 rounded-md">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-green-800">Admin access active</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          You have full administrative privileges. Access the admin dashboard to manage the platform.
                          {adminRequest?.processedAt && (
                            <span className="block mt-1">
                              Approved: {new Date(adminRequest.processedAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                        <Link
                          to="/admin"
                          className="mt-2 inline-block bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        >
                          Go to Admin Dashboard
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Privacy & Security */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Privacy & Security</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Your personal information is securely stored and will only be used for order processing and customer service.
                    </p>
                    <Link
                      to="/privacy-policy"
                      className="text-sm text-yellow-800 underline hover:no-underline"
                    >
                      View Privacy Policy
                    </Link>
                  </div>

                  {/* Account Deletion - Danger Zone */}
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                    <p className="text-sm text-red-700 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      Delete Account
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

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  This will permanently delete your account and all associated data including:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-1">
                  <li>Profile information</li>
                  <li>Order history</li>
                  <li>Favorites and wishlists</li>
                  <li>Checkout data</li>
                  <li>Contact messages</li>
                  <li>Admin requests</li>
                </ul>
                <p className="text-sm text-red-600 font-medium">
                  This action cannot be undone!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      deleteError && deleteError.title === 'Incorrect Password' 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label htmlFor="deleteConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                    Type "DELETE" to confirm
                  </label>
                  <input
                    type="text"
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      deleteError && deleteError.title === 'Invalid Confirmation' 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Type DELETE to confirm"
                  />
                </div>
              </div>

              {/* Error Dialog */}
              {deleteError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {deleteError.title}
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{deleteError.message}</p>
                        {deleteError.details && (
                          <p className="mt-1 text-xs text-red-600">{deleteError.details}</p>
                        )}
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={clearDeleteError}
                          className="text-sm font-medium text-red-800 hover:text-red-700 focus:outline-none focus:underline"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteConfirmText('');
                    setDeleteError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deletePassword === '' || deleteConfirmText !== 'DELETE'}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
