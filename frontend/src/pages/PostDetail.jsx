import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext/AuthContext';
import { usePosts } from '../context/postContext/PostContext';
import BackendUnavailable from '../components/common/BackendUnavailable';
import axios from 'axios';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { backendAvailable, checkBackendAvailability } = usePosts();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBackendChecked, setIsBackendChecked] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Create axios instance with credentials
  const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
  });

  // Check backend availability
  useEffect(() => {
    const checkBackend = async () => {
      await checkBackendAvailability();
      setIsBackendChecked(true);
    };

    checkBackend();
  }, [checkBackendAvailability]);

  // Check if user is the post owner
  const isOwner = user && post && post.user._id === user._id;

  // Check if user has liked the post
  const isLiked = user && post && post.likes.includes(user._id);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      console.log('Fetching post...');

      // Skip fetching if backend is not available
      if (!backendAvailable) {
        setError('Backend server is not available. Please try again later.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. Please try again.');

        // Redirect to 404 if post not found
        if (err.response && err.response.status === 404) {
          // navigate('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && isBackendChecked) {
      fetchPost();
    }
  }, [id, navigate, backendAvailable, isBackendChecked]);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/post/${id}` } });
      return;
    }
    
    try {
      const response = await api.post(`/posts/${id}/like`);

      // Update post with new likes
      setPost(prev => ({
        ...prev,
        likes: response.data.liked
          ? [...prev.likes, user.id]
          : prev.likes.filter(likeId => likeId !== user.id),
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/post/${id}` } });
      return;
    }

    if (!comment.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await api.post(`/posts/${id}/comment`, { text: comment });

      // Update post with new comment
      setPost(prev => ({
        ...prev,
        comments: [...prev.comments, response.data.comment],
      }));

      // Clear comment input
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle post deletion
  const handleDelete = async () => {
    if (!isOwner) return;

    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true);

      try {
        await api.delete(`/posts/${id}`);
        navigate('/profile/' + user.username);
      } catch (error) {
        console.error('Error deleting post:', error);
        setIsDeleting(false);
      }
    }
  };

  // Show loading state
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
        <BackendUnavailable message="The backend server is not available. Post details will not be available until the server is running." />
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

  return (
    <div className="container mx-auto px-4 py-8">
      {post && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-2/3 flex justify-center items-center">
              <img
                src={post.imageUrl}
                alt={post.caption || 'Image'}
                className=" h-full max-h-[75vh] object-cover"
              />
            </div>

            {/* Post details */}
            <div className="md:w-1/3 p-6">
              {/* User info */}
              <div className="flex items-center mb-4">
                <Link to={`/profile/${post.user.username}`} className="flex items-center">
                  <img
                    src={post.user.profilePic || ''}
                    alt={post.user.username}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {post.user.username}
                  </span>
                </Link>

                {/* Post*/}
                {isOwner && (
                   <div className="ml-auto">
                    <div className="relative inline-block text-left">
                      <div>
                        <button
                          type="button"
                          className="flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>

                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Link
                            to={`/edit-post/${post._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Caption */}
              {post.caption && (
                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300">{post.caption}</p>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/search?q=${tag}`}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-blue-500 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Date */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Posted on {formatDate(post.createdAt)}
              </div>

              {/* Like button */}
              <div className="flex items-center mb-6">
                <button
                  onClick={handleLikeToggle}
                  className={`${isOwner ? '' : ''}  flex items-center text-gray-500 hover:text-red-500 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={isLiked ? 0 : 2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="ml-2">
                    {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                  </span>
                </button>
              </div>

              {/* Comments section */}
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Comments ({post.comments.length})
                </h3>

                {/* Comment list */}
                <div className="max-h-60 overflow-y-auto mb-4">
                  {post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <div key={comment._id} className="mb-3">
                        <div className="flex items-start">
                          <Link to={`/profile/${comment.user.username}`}>
                            <img
                              src={comment.user.profilePic || 'https://via.placeholder.com/32'}
                              alt={comment.user.username}
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                          </Link>
                          <div>
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                              <Link
                                to={`/profile/${comment.user.username}`}
                                className="font-medium text-gray-800 dark:text-gray-200"
                              >
                                {comment.user.username}
                              </Link>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {comment.text}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>

                {/* Comment form */}
                <form onSubmit={handleCommentSubmit}>
                  <div className="flex">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 text-black  px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-0 focus:ring-blue-500"
                      disabled={isSubmitting || !isAuthenticated}
                    />
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-r-md text-white font-medium ${
                        isSubmitting || !comment.trim() || !isAuthenticated
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      disabled={isSubmitting || !comment.trim() || !isAuthenticated}
                    >
                      {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>

                  {!isAuthenticated && (
                    <p className="text-xs text-gray-500 mt-1">
                      <Link to="/login" className="text-blue-500 hover:underline">
                        Log in
                      </Link>{' '}
                      to like or comment on this post.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
