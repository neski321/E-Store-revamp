import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc, query, orderBy, getDoc, deleteDoc, collectionGroup } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminPage = () => {
  const { currentUser } = useAuth();
  const [adminRequests, setAdminRequests] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [activeTab, setActiveTab] = useState('admin-requests');
  const [messageFilter, setMessageFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState(null);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Messages', icon: '📋', count: contactMessages.length },
    { value: 'unread', label: 'Unread', icon: '🔴', count: contactMessages.filter(m => m.status === 'unread').length },
    { value: 'responded', label: 'Responded', icon: '✅', count: contactMessages.filter(m => m.status === 'responded').length }
  ];

  // Get current filter option
  const currentFilter = filterOptions.find(option => option.value === messageFilter) || filterOptions[0];

  // Handle filter selection
  const handleFilterSelect = (filterValue) => {
    setMessageFilter(filterValue);
    setShowFilterDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Check if user is admin
  const checkAdminRole = useCallback(async () => {
    if (!currentUser) {
      setIsAdmin(false);
      setCheckingRole(false);
      return;
    }
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsAdmin(userData.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setCheckingRole(false);
    }
  }, [currentUser]);

  // Fetch admin requests
  const fetchAdminRequests = useCallback(async () => {
    if (!currentUser || !isAdmin) return;
    
    try {
      setLoading(true);
      const requestsRef = collection(db, 'adminRequests');
      const q = query(requestsRef, orderBy('requestedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const requests = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(request => request.userId !== currentUser.uid); // Filter out admin's own requests
      
      setAdminRequests(requests);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      setMessage('Failed to load admin requests');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin]);

  // Fetch contact messages
  const fetchContactMessages = useCallback(async () => {
    if (!currentUser || !isAdmin) return;
    
    try {
      setLoading(true);
      
      // Try collection group query first (most efficient)
      try {
        const messagesRef = collectionGroup(db, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const allMessages = querySnapshot.docs.map(doc => {
          // Extract userId from the document path
          const pathParts = doc.ref.path.split('/');
          const userId = pathParts[1]; // contactMessages/{userId}/messages/{messageId}
          
          return {
            id: doc.id,
            userId: userId,
            ...doc.data()
          };
        });
        
        setContactMessages(allMessages);
        return;
        
      } catch (collectionGroupError) {
        // Fallback: Get all users and check their contact messages
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        const allMessages = [];
        for (const userDoc of usersSnapshot.docs) {
          const userMessagesRef = collection(db, 'contactMessages', userDoc.id, 'messages');
          const messagesSnapshot = await getDocs(userMessagesRef);
          messagesSnapshot.docs.forEach(messageDoc => {
            allMessages.push({
              id: messageDoc.id,
              userId: userDoc.id,
              ...messageDoc.data()
            });
          });
        }
        
        // Sort by timestamp descending
        allMessages.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB - dateA;
        });
        setContactMessages(allMessages);
      }
      
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      setMessage('Failed to load contact messages');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin]);

  // Helper function to safely format dates
  const formatDate = (dateValue) => {
    if (!dateValue) return 'No date';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Filter and search contact messages
  const filteredMessages = contactMessages.filter(message => {
    // Filter by status
    if (messageFilter !== 'all' && message.status !== messageFilter) {
      return false;
    }
    
    // Filter by category
    if (categoryFilter !== 'all' && message.category !== categoryFilter) {
      return false;
    }
    
    // Filter by priority
    if (priorityFilter !== 'all' && message.priority !== priorityFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        message.name?.toLowerCase().includes(searchLower) ||
        message.email?.toLowerCase().includes(searchLower) ||
        message.subject?.toLowerCase().includes(searchLower) ||
        message.message?.toLowerCase().includes(searchLower) ||
        message.category?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Generate universal email reply data
  const generateEmailReplyData = (message) => {
    const subject = `Re: ${message.subject}`;
    const body = `Hi ${message.name},\n\nThank you for contacting us regarding: ${message.subject}\n\nYour message:\n"${message.message}"\n\nBest regards,\nSupport Team`;
    
    return {
      to: message.email,
      subject: subject,
      body: body,
      messageId: message.id,
      userId: message.userId,
      // Universal mailto URL that works with any email client
      mailtoUrl: `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    };
  };

  // Handle email reply
  const handleEmailReply = (message) => {
    const emailData = generateEmailReplyData(message);
    setEmailModalData(emailData);
    setShowEmailModal(true);
  };

  // Handle different email service options
  const handleEmailService = (service, emailData) => {
    let url = '';
    
    switch (service) {
      case 'default':
        // Try to open default email client
        try {
          window.location.href = emailData.mailtoUrl;
        } catch (error) {
          console.error('Error opening email client:', error);
          copyEmailToClipboard(emailData);
        }
        break;
        
      case 'gmail':
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailData.to)}&su=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        window.open(url, '_blank');
        break;
        
      case 'outlook':
        url = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(emailData.to)}&subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        window.open(url, '_blank');
        break;
        
      case 'yahoo':
        url = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(emailData.to)}&subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        window.open(url, '_blank');
        break;
        
      case 'copy':
        copyEmailToClipboard(emailData);
        break;
        
      default:
        copyEmailToClipboard(emailData);
    }
    
    // Mark message as responded
    markMessageAsResponded(emailData.messageId, emailData.userId);
    setShowEmailModal(false);
  };

  // Copy email data to clipboard as fallback
  const copyEmailToClipboard = async (emailData) => {
    const emailText = `To: ${emailData.to}\nSubject: ${emailData.subject}\n\n${emailData.body}`;
    
    try {
      await navigator.clipboard.writeText(emailText);
      setMessage('Email content copied to clipboard! Paste it into your email client.');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback: show success message
      setMessage('Email content ready to copy! Please manually copy the email details.');
      setTimeout(() => setMessage(''), 5000);
    }
  };


  // Mark message as responded
  const markMessageAsResponded = async (messageId, userId) => {
    try {
      const messageRef = doc(db, 'contactMessages', userId, 'messages', messageId);
      const now = new Date();
      await updateDoc(messageRef, {
        status: 'responded',
        responseTimestamp: now.toISOString(),
        updatedAt: now.toISOString()
      });
      
      // Refresh contact messages
      fetchContactMessages();
      setMessage('Message marked as responded');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error marking message as responded:', error);
      setMessage('Failed to update message status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Show delete confirmation dialog
  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    try {
      setLoading(true);
      const messageRef = doc(db, 'contactMessages', messageToDelete.userId, 'messages', messageToDelete.id);
      await deleteDoc(messageRef);
      
      // Refresh contact messages
      fetchContactMessages();
      setMessage('Message deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting message:', error);
      setMessage('Failed to delete message');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  };

  // Handle admin request approval/rejection/revocation
  const handleRequestAction = async (requestId, action) => {
    // For reject and revoke actions, show note modal first
    if (action === 'rejected' || action === 'revoked') {
      const request = adminRequests.find(req => req.id === requestId);
      if (request) {
        setSelectedRequest(request);
        setSelectedAction(action);
        setAdminNote('');
        setShowNoteModal(true);
      }
      return;
    }
    
    // For approve action, proceed directly
    await processRequestAction(requestId, action, '');
  };

  // Process the actual request action
  const processRequestAction = async (requestId, action, note = '') => {
    try {
      setLoading(true);
      
      const request = adminRequests.find(req => req.id === requestId);
      if (!request) {
        setMessage('Request not found');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      // Update request status
      const requestRef = doc(db, 'adminRequests', requestId);
      const updateData = {
        status: action,
        processedAt: new Date().toISOString(),
        processedBy: currentUser.uid
      };
      
      // Add note (always include the field, even if empty)
      updateData.adminNote = note.trim() || '';
      console.log('Adding admin note:', note.trim() || '(empty)');
      
      console.log('Updating admin request with data:', updateData);
      await updateDoc(requestRef, updateData);
      
      // Update user role based on action
      const userRef = doc(db, 'users', request.userId);
      if (action === 'approved') {
        await updateDoc(userRef, {
          role: 'admin',
          adminApprovedAt: new Date().toISOString(),
          adminApprovedBy: currentUser.uid
        });
      } else if (action === 'revoked') {
        await updateDoc(userRef, {
          role: 'user',
          adminRevokedAt: new Date().toISOString(),
          adminRevokedBy: currentUser.uid
        });
      }
      
      // Refresh requests
      await fetchAdminRequests();
      
      setMessage(`Request ${action} successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(`Error ${action} request:`, error);
      setMessage(`Failed to ${action} request`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle note modal submission
  const handleNoteSubmit = async () => {
    if (selectedRequest && selectedAction) {
      console.log('Submitting note:', adminNote);
      console.log('For action:', selectedAction);
      console.log('For request:', selectedRequest.id);
      await processRequestAction(selectedRequest.id, selectedAction, adminNote);
      setShowNoteModal(false);
      setSelectedRequest(null);
      setSelectedAction('');
      setAdminNote('');
    }
  };

  // Handle note modal cancellation
  const handleNoteCancel = () => {
    setShowNoteModal(false);
    setSelectedRequest(null);
    setSelectedAction('');
    setAdminNote('');
  };

  // Check admin role and load admin requests on component mount
  useEffect(() => {
    checkAdminRole();
  }, [checkAdminRole]);

  // Load admin requests and contact messages when admin role is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchAdminRequests();
      fetchContactMessages();
    }
  }, [isAdmin, fetchAdminRequests, fetchContactMessages]);

  // Show loading while checking admin role
  if (checkingRole) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Checking Access...</h2>
            <p className="text-gray-500 mt-2">Please wait while we verify your permissions</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the admin dashboard. Only administrators can view this page.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto py-12 px-4 relative">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your e-commerce platform with powerful administrative tools
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Product Control Card */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Product Management</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Create, update, and manage your product catalog with full control over inventory and details.
                  </p>
                  <Link
                    to="/product-crud"
                    className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Manage Products
                  </Link>
                </div>
              </div>

                  {/* Newsletter Management Card */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Newsletter Management</h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Manage newsletter subscriptions, view subscriber analytics, and export subscriber data.
                      </p>
                      <Link
                        to="/newsletter-management"
                        className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Manage Newsletter
                      </Link>
                    </div>
                  </div>

                  {/* Newsletter Templates Card */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Email Templates</h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Create and manage email templates for welcome emails, newsletters, and other communications.
                      </p>
                      <Link
                        to="/email-templates"
                        className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Manage Templates
                      </Link>
                    </div>
                  </div>


              {/* Review Moderation Card - Temporarily Disabled */}
              <div className="bg-white rounded-2xl shadow-lg opacity-60 relative">
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-2xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Coming Soon</p>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Review Moderation</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Moderate customer reviews and manage server status monitoring tools.
                  </p>
                  <button
                    disabled
                    className="inline-flex items-center justify-center w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Temporarily Disabled
                  </button>
                </div>
              </div>

              {/* Server Status Card - Temporarily Disabled */}
              <div className="bg-white rounded-2xl shadow-lg opacity-60 relative">
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-2xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Coming Soon</p>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Server Status</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Monitor server health, performance metrics, and system status in real-time.
                  </p>
                  <button
                    disabled
                    className="inline-flex items-center justify-center w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Temporarily Disabled
                  </button>
                </div>
              </div>

            </div>

            {/* Tab Navigation */}
            <div className="mt-16 flex justify-center">
              <div className="bg-white rounded-2xl p-2 shadow-lg">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('admin-requests')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === 'admin-requests'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    👥 Admin Requests
                  </button>
                  <button
                    onClick={() => setActiveTab('contact-messages')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === 'contact-messages'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    💬 Contact Messages
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Requests Section */}
            {activeTab === 'admin-requests' && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Admin Access Requests</h3>
                <button
                  onClick={fetchAdminRequests}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {message && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-green-800">{message}</p>
                </div>
              )}

              {adminRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Admin Requests</h4>
                  <p className="text-gray-600">There are currently no pending admin access requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{request.userName}</h4>
                            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'revoked'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{request.userEmail}</p>
                          <p className="text-sm text-gray-500 mb-3">{request.reason}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
                            {request.processedAt && (
                              <span className="ml-4">
                                {request.status === 'approved' ? 'Approved' : 
                                 request.status === 'revoked' ? 'Revoked' : 'Rejected'}: {new Date(request.processedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleRequestAction(request.id, 'approved')}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRequestAction(request.id, 'rejected')}
                              disabled={loading}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        
                        {request.status === 'approved' && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleRequestAction(request.id, 'revoked')}
                              disabled={loading}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Revoke Access
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Contact Messages Section */}
            {activeTab === 'contact-messages' && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 relative overflow-visible">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Contact Messages</h3>
                  <button
                    onClick={fetchContactMessages}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {/* Search and Filter Controls */}
                <div className="mb-8">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Search messages by name, email, or subject..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="flex gap-3 items-center">
                      <div className="relative filter-dropdown">
                        <button
                          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                          className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm min-w-[160px]"
                        >
                          <span className="text-lg">{currentFilter.icon}</span>
                          <span className="font-medium text-gray-700">{currentFilter.label}</span>
                          <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {currentFilter.count}
                          </span>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showFilterDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                            {filterOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleFilterSelect(option.value)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                                  messageFilter === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                <span className="text-lg">{option.icon}</span>
                                <span className="font-medium flex-1">{option.label}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  messageFilter === option.value 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {option.count}
                                </span>
                                {messageFilter === option.value && (
                                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Results Counter */}
                      <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium">{filteredMessages.length}</span>
                        <span>of {contactMessages.length} messages</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Filter Pills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-medium">Category:</span>
                      <div className="flex gap-1">
                        {['all', 'general', 'support', 'billing', 'technical', 'feedback'].map(category => (
                          <button
                            key={category}
                            onClick={() => setCategoryFilter(category)}
                            className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                              categoryFilter === category
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                            }`}
                          >
                            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Priority Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-medium">Priority:</span>
                      <div className="flex gap-1">
                        {['all', 'normal', 'high', 'urgent'].map(priority => (
                          <button
                            key={priority}
                            onClick={() => setPriorityFilter(priority)}
                            className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                              priorityFilter === priority
                                ? priority === 'high' || priority === 'urgent'
                                  ? 'bg-red-100 text-red-700 border border-red-300'
                                  : 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                            }`}
                          >
                            {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(categoryFilter !== 'all' || priorityFilter !== 'all' || messageFilter !== 'all' || searchTerm) && (
                      <button
                        onClick={() => {
                          setCategoryFilter('all');
                          setPriorityFilter('all');
                          setMessageFilter('all');
                          setSearchTerm('');
                        }}
                        className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 border border-gray-300 transition-all duration-200 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {message && (
                  <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                    {message}
                  </div>
                )}

                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {contactMessages.length === 0 ? 'No Contact Messages' : 'No Messages Found'}
                    </h3>
                    <p className="text-gray-600">
                      {contactMessages.length === 0 
                        ? 'No contact messages have been submitted yet.' 
                        : 'No messages match your current search or filter criteria.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredMessages.map((message) => (
                      <div key={message.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{message.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                message.category === 'support' 
                                  ? 'bg-red-100 text-red-800'
                                  : message.category === 'billing'
                                  ? 'bg-purple-100 text-purple-800'
                                  : message.category === 'shipping'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                message.priority === 'high' 
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {message.priority === 'high' ? 'High Priority' : 'Normal'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                            <h5 className="text-md font-medium text-gray-900 mb-2">{message.subject}</h5>
                            <p className="text-gray-700 mb-3">{message.message}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Submitted: {formatDate(message.timestamp)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  message.status === 'responded' 
                                    ? 'bg-green-100 text-green-800'
                                    : message.status === 'unread'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                </span>
                                {message.tags && message.tags.length > 0 && (
                                  <div className="flex space-x-1">
                                    {message.tags.map((tag, index) => (
                                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEmailReply(message)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded transition-colors duration-200"
                                  title="Reply via Email"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteClick(message)}
                                  disabled={loading}
                                  className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete message"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats Section */}
            <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Product Management</h4>
                  <p className="text-gray-600">Fully operational</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Review Moderation</h4>
                  <p className="text-gray-600">Under development</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Server Status</h4>
                  <p className="text-gray-600">Under development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Admin Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedAction === 'rejected' ? 'Reject Admin Request' : 'Revoke Admin Access'}
                  </h3>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  {selectedAction === 'rejected' 
                    ? 'Please provide a reason for rejecting this admin request. This note will be visible to the user.'
                    : 'Please provide a reason for revoking admin access. This note will be visible to the user.'
                  }
                </p>
                
                {selectedRequest && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">User:</span> {selectedRequest.userName} ({selectedRequest.userEmail})
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Requested:</span> {new Date(selectedRequest.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="adminNote" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (Optional but Recommended)
                  </label>
                  <textarea
                    id="adminNote"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder={`Enter reason for ${selectedAction === 'rejected' ? 'rejecting' : 'revoking'} this request...`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleNoteCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNoteSubmit}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : `${selectedAction === 'rejected' ? 'Reject' : 'Revoke'} Request`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && messageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Contact Message</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this contact message? This action cannot be undone.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">
                <p><strong>From:</strong> {messageToDelete.name} ({messageToDelete.email})</p>
                <p><strong>Subject:</strong> {messageToDelete.subject}</p>
                <p><strong>Category:</strong> {messageToDelete.category}</p>
                <p><strong>Submitted:</strong> {formatDate(messageToDelete.timestamp)}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Service Selection Modal */}
      {showEmailModal && emailModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Choose Email Service</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Select your preferred email service to compose a reply to <strong>{emailModalData.to}</strong>
            </p>
            
            <div className="space-y-3 mb-6">
              {/* Default Email Client */}
              <button
                onClick={() => handleEmailService('default', emailModalData)}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Default Email Client</div>
                  <div className="text-sm text-gray-500">Opens your system's default email app</div>
                </div>
              </button>

              {/* Gmail */}
              <button
                onClick={() => handleEmailService('gmail', emailModalData)}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819v9.273L12 8.64l6.545 4.454V3.82h3.819c.904 0 1.636.732 1.636 1.636z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Gmail</div>
                  <div className="text-sm text-gray-500">Open in Gmail web interface</div>
                </div>
              </button>

              {/* Outlook */}
              <button
                onClick={() => handleEmailService('outlook', emailModalData)}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Outlook</div>
                  <div className="text-sm text-gray-500">Open in Outlook web interface</div>
                </div>
              </button>

              {/* Yahoo Mail */}
              <button
                onClick={() => handleEmailService('yahoo', emailModalData)}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Yahoo Mail</div>
                  <div className="text-sm text-gray-500">Open in Yahoo Mail web interface</div>
                </div>
              </button>

              {/* Copy to Clipboard */}
              <button
                onClick={() => handleEmailService('copy', emailModalData)}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Copy to Clipboard</div>
                  <div className="text-sm text-gray-500">Copy email content to paste anywhere</div>
                </div>
              </button>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;
