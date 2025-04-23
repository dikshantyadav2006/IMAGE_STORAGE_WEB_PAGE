import React, { useEffect, useRef, useCallback } from 'react';
import { usePosts } from '../../context/postContext/PostContext';
import ImageCard from './ImageCard';

const ImageGallery = ({ userId = null }) => {
  const {
    posts,
    userPosts,
    loading,
    error,
    fetchPosts,
    fetchUserPosts,
    loadMorePosts,
    loadMoreUserPosts
  } = usePosts();

  const observer = useRef();
  const displayPosts = userId ? (userPosts || []) : (posts || []);

  // Setup intersection observer for infinite scrolling
  const lastPostElementRef = useCallback(node => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (userId) {
          loadMoreUserPosts(userId);
        } else {
          loadMorePosts();
        }
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadMorePosts, loadMoreUserPosts, userId]);

  // Fetch posts on component mount
  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId);
    } else {
      fetchPosts();
    }
  }, []);

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => userId ? fetchUserPosts(userId) : fetchPosts()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Handle loading and empty state
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500">

        </div>
      </div>
    );
  }

  if (displayPosts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No posts found</p>
        {userId && (
          <p className="mt-2 text-gray-400">
            This user hasn't posted any images yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Masonry Layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {displayPosts.map((post, index) => {
          if (displayPosts.length === index + 1) {
            return (
              <div ref={lastPostElementRef} key={post._id}>
                <ImageCard post={post} />
              </div>
            );
          } else {
            return <ImageCard key={post._id} post={post} />;
          }
        })}
      </div>
    </div>
  );
};

export default ImageGallery;
