import React, { useEffect, useState } from 'react';
import ImageGallery from '../components/gallery/ImageGallery';
import BackendUnavailable from '../components/common/BackendUnavailable';
import { useAuth } from '../context/authContext/AuthContext';
import { usePosts } from '../context/postContext/PostContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { backendAvailable, checkBackendAvailability } = usePosts();
  const [isBackendChecked, setIsBackendChecked] = useState(false);

  // Check backend availability on component mount
  useEffect(() => {
    const checkBackend = async () => {
      await checkBackendAvailability();
      setIsBackendChecked(true);
    };

    checkBackend();
  }, [checkBackendAvailability]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Discover Amazing Images
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Explore our collection of beautiful images shared by our community
        </p>

        {!isAuthenticated && (
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-4"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="inline-block px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Sign Up
            </a>
          </div>
        )}
      </div>

      {isBackendChecked && !backendAvailable ? (
        <BackendUnavailable message="The backend server is not available. Image gallery features will not work until the server is running." />
      ) : (
        <ImageGallery />
      )}
    </div>
  );
};

export default Home;
