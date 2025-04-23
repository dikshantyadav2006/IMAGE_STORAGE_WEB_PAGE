import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../../context/postContext/PostContext';
import { useAuth } from '../../context/authContext/AuthContext';

const ImageCard = ({ post }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deletePost, toggleLike } = usePosts();
  const { user, isAuthenticated } = useAuth();

  const isOwner = user && post?.user?._id === user._id;
  const isLiked = user && post?.likes?.includes(user._id);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle like/unlike
  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login or show login prompt
      return;
    }

    try {
      await toggleLike(post._id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle delete
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isOwner) return;

    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true);
      try {
        await deletePost(post._id);
      } catch (error) {
        console.error('Error deleting post:', error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="break-inside-avoid mb-4 rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300">
      <Link to={post?._id ? `/post/${post._id}` : '#'} className="block relative">
        {/* Image */}
        <img
          src={post?.imageUrl || 'https://via.placeholder.com/400x300?text=Image+Not+Available'}
          alt={post?.caption || 'Image'}
          className="w-full object-cover"
          loading="lazy"
        />

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex space-x-2">
            {/* Like button */}
            <button
              onClick={handleLikeToggle}
              className={`p-2 rounded-full ${
                isLiked ? 'bg-red-500' : 'bg-white'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${isLiked ? 'text-white' : 'text-red-500'}`}
                fill={isLiked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            {/* Options button (for owner) */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                  className="p-2 rounded-full bg-white text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>

                {/* Options dropdown */}
                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <Link
                      to={`/edit-post/${post._id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit Post
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Post'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Post info */}
      <div className="p-4">
        {/* User info */}
        <div className="flex items-center mb-2">
          <Link to={post?.user?.username ? `/profile/${post.user.username}` : '#'} className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={post?.user?.profilePic || 'https://via.placeholder.com/40'}
              alt={post?.user?.username || 'User'}
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {post?.user?.username || 'Unknown User'}
            </span>
          </Link>

          {/* Private indicator */}
          {post?.isPrivate && (
            <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
              Private
            </span>
          )}
        </div>

        {/* Caption */}
        {post?.caption && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
            {post.caption}
          </p>
        )}

        {/* Tags */}
        {post?.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${tag}`}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-blue-500 px-2 py-1 rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          <div className="flex items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {post?.likes?.length || 0}
          </div>

          <div className="flex items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {post?.comments?.length || 0}
          </div>

          <span className="ml-auto">{post?.createdAt ? formatDate(post.createdAt) : 'Unknown date'}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
