import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePicture = ({ 
  profilePicture, 
  size = 'w-10 h-10', 
  className = '', 
  showInitials = true,
  customInitials = null 
}) => {
  const { currentUser } = useAuth();

  const getInitials = () => {
    if (customInitials) return customInitials;
    
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
    if (profilePicture) return profilePicture;
    return null;
  };

  return (
    <div className={`${size} relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}>
      {getDisplayPicture() ? (
        <img
          src={getDisplayPicture()}
          alt="Profile"
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it to show initials
            e.target.style.display = 'none';
          }}
        />
      ) : showInitials ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
          {getInitials()}
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePicture;
