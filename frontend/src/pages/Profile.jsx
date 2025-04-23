import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/profile/ProfileHeader';
import ImageGallery from '../components/gallery/ImageGallery';
import BackendUnavailable from '../components/common/BackendUnavailable';
import { useAuth } from '../context/authContext/AuthContext';
import { usePosts } from '../context/postContext/PostContext';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, getUserProfile, loading: authLoading, backendAvailable, checkBackendAvailability } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBackendChecked, setIsBackendChecked] = useState(false);

  // Check if this is the user's own profile
  // console.log('User:', user);
  // console.log('Profile:', profile);
  const isOwnProfile = user && profile && user._id === profile._id;

  // Check backend availability
  useEffect(() => {
    const checkBackend = async () => {
      if(isBackendChecked) return;
      await checkBackendAvailability();
      setIsBackendChecked(true);
    };

    checkBackend();
  }, [checkBackendAvailability]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      // Skip fetching if backend is not available
      if (!backendAvailable) {
        setError('Backend server is not available. Please try again later.');
        setLoading(false);
        return;
      }

      try {
        const profileData = await getUserProfile(username);
        setProfile(profileData);
        console.log('Profile data:', profileData);
      } catch (err) {
        console.error('Error fetching profile:', err);

        if (err.message === 'Backend server is not available') {
          setError('Backend server is not available. Please try again later.');
        } else {
          setError('Failed to load profile. Please try again.');

          // Redirect to 404 if profile not found
          if (err.response && err.response.status === 404) {
            navigate('/not-found');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (username && isBackendChecked) {
      fetchProfile();
    }
  }, [username, getUserProfile, navigate, backendAvailable, isBackendChecked]);

  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show backend unavailable state
  if (isBackendChecked && !backendAvailable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackendUnavailable message="The backend server is not available. Profile features will not work until the server is running." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show private profile message
  if (profile && profile.private && !isOwnProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader profile={profile} isOwnProfile={false} />

        <div className="text-center py-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-xl font-bold mb-2">This Account is Private</h2>
          <p className="text-gray-500">
            Follow this account to see their photos and videos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {profile && (
        <>
          <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Posts</h2>
            <ImageGallery userId={profile._id} />
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
