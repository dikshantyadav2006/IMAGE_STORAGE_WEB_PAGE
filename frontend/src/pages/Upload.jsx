import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/upload/ImageUpload';
import BackendUnavailable from '../components/common/BackendUnavailable';
import { useAuth } from '../context/authContext/AuthContext';
import { usePosts } from '../context/postContext/PostContext';

const Upload = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { backendAvailable, checkBackendAvailability } = usePosts();
  const [isBackendChecked, setIsBackendChecked] = useState(false);

  // Check backend availability
  useEffect(() => {
    const checkBackend = async () => {
      await checkBackendAvailability();
      setIsBackendChecked(true);
    };

    checkBackend();
  }, [checkBackendAvailability]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: '/upload' } });
    }
  }, [isAuthenticated, loading, navigate]);

  // Handle successful upload
  const handleUploadSuccess = (post) => {
    navigate(`/post/${post._id}`);
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold text-center mb-8">
          Share Your Image
        </h1>
        <BackendUnavailable message="The backend server is not available. Upload features will not work until the server is running." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Share Your Image
      </h1>

      <ImageUpload onSuccess={handleUploadSuccess} />
    </div>
  );
};

export default Upload;
