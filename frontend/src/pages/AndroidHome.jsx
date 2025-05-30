import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext/AuthContext';
import { usePosts } from '../context/postContext/PostContext';
import AndroidImageCard from '../components/android/AndroidImageCard';
import AndroidBottomNav from '../components/android/AndroidBottomNav';
import AndroidHeader from '../components/android/AndroidHeader';
import BackendUnavailable from '../components/common/BackendUnavailable';

const AndroidHome = () => {
  const { isAuthenticated, user } = useAuth();
  const { posts, loading, error, fetchPosts, backendAvailable, checkBackendAvailability } = usePosts();
  const [isBackendChecked, setIsBackendChecked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check backend availability
  useEffect(() => {
    const checkBackend = async () => {
      await checkBackendAvailability();
      setIsBackendChecked(true);
    };
    
    checkBackend();
  }, [checkBackendAvailability]);

  // Fetch posts when component mounts
  useEffect(() => {
    if (isBackendChecked && backendAvailable) {
      fetchPosts();
    }
  }, [isBackendChecked, backendAvailable, fetchPosts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  // Show backend unavailable state
  if (isBackendChecked && !backendAvailable) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AndroidHeader />
        <div className="p-4">
          <BackendUnavailable message="The backend server is not available. Please make sure the server is running to view posts." />
        </div>
        <AndroidBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Android-style Header */}
      <AndroidHeader />

      {/* Main Content */}
      <div className="pb-16"> {/* Bottom padding for navigation */}
        {/* Pull to refresh indicator */}
        {refreshing && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Posts Grid */}
        {loading && !refreshing ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 p-1">
            {posts.map((post) => (
              <AndroidImageCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-20 right-4 z-10">
          <button
            onClick={() => window.location.href = '/android-upload'}
            className="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Android-style Bottom Navigation */}
      <AndroidBottomNav />
    </div>
  );
};

export default AndroidHome;
