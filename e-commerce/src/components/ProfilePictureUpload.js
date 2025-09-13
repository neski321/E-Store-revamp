import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePictureUpload = ({ currentProfilePicture, onPictureUpdate, size = 'w-24 h-24' }) => {
  const { currentUser, updateUserProfile, role } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB');
      return;
    }

    setUploadError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
    uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file) => {
    if (!currentUser) {
      setUploadError('You must be logged in to upload a profile picture');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Create FormData for the upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('user_id', currentUser.uid);
      formData.append('folder', 'profile-pictures');

      // Upload to backend with authentication headers
      const response = await fetch('/api/upload-profile-picture/', {
        method: 'POST',
        headers: {
          'X-User-ID': currentUser.uid,
          'X-User-Email': currentUser.email || '',
          'X-User-Role': role || 'user',
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Update user profile in Firestore with the new picture URL
        await updateUserProfile({
          profilePicture: result.url,
          profilePictureUpdatedAt: new Date().toISOString()
        });

        // Notify parent component
        if (onPictureUpdate) {
          onPictureUpdate(result.url);
        }

        setMessage('Profile picture updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setUploadError(result.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUploadError('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!currentUser) return;

    try {
      // Update user profile to remove picture URL
      await updateUserProfile({
        profilePicture: null,
        profilePictureUpdatedAt: new Date().toISOString()
      });

      // Notify parent component
      if (onPictureUpdate) {
        onPictureUpdate(null);
      }

      setPreviewUrl(null);
      setMessage('Profile picture removed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setUploadError('Failed to remove profile picture. Please try again.');
    }
  };

  const getInitials = () => {
    if (currentUser) {
      if (currentUser.isAnonymous) {
        return 'G';
      } else if (currentUser.email) {
        return currentUser.email.charAt(0).toUpperCase();
      }
    }
    return 'U';
  };

  const getDisplayPicture = () => {
    if (previewUrl) return previewUrl;
    if (currentProfilePicture) return currentProfilePicture;
    return null;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={`${size} relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
        {getDisplayPicture() ? (
          <img
            src={getDisplayPicture()}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
            {getInitials()}
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isUploading ? 'Uploading...' : 'Upload Picture'}
        </button>
        
        {getDisplayPicture() && (
          <button
            onClick={removeProfilePicture}
            disabled={isUploading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadError && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {uploadError}
        </div>
      )}

      {message && (
        <div className="text-green-600 text-sm text-center max-w-xs">
          {message}
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
