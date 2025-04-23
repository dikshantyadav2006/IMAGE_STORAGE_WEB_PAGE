import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/authContext/AuthContext';

const ProfileHeader = ({ profile, isOwnProfile }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  const { uploadProfilePicture } = useAuth();
  
  // Handle profile picture upload
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      await uploadProfilePicture(file);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Trigger file input click
  const handleProfilePicClick = () => {
    if (isOwnProfile) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center">
        {/* Profile Picture */}
        <div className="relative mb-4 md:mb-0 md:mr-6">
          <div 
            className={`w-32 h-32 rounded-full overflow-hidden ${isOwnProfile ? 'cursor-pointer' : ''}`}
            onClick={handleProfilePicClick}
          >
            <img
              src={profile.profilePic || 'https://via.placeholder.com/128'}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
            
            {/* Upload overlay (only for own profile) */}
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            )}
            
            {/* Loading overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePicUpload}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
          />
        </div>
        
        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile.username}
          </h1>
          
          {profile.firstName && profile.lastName && (
            <p className="text-gray-600 dark:text-gray-300">
              {profile.firstName} {profile.lastName}
            </p>
          )}
          
          {profile.bio && (
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {profile.bio}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex justify-center md:justify-start mt-4 space-x-6">
            <div className="text-center">
              <span className="block font-bold text-gray-900 dark:text-white">
                {profile.totalPosts || 0}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Posts
              </span>
            </div>
            
            {/* Add more stats here if needed */}
          </div>
        </div>
        
        {/* Actions (for own profile) */}
        {isOwnProfile && (
          <div className="mt-4 md:mt-0 md:ml-4">
            <a
              href="/edit-profile"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Edit Profile
            </a>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
