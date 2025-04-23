import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext/AuthContext';
import { usePosts } from '../context/postContext/PostContext';
import BackendUnavailable from '../components/common/BackendUnavailable';
import axios from 'axios';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { backendAvailable, checkBackendAvailability } = usePosts();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBackendChecked, setIsBackendChecked] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [formData, setFormData] = useState({
    caption: '',
    tags: '',
    isPrivate: false,
  });

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: `/edit-post/${id}` } });
    }
  }, [isAuthenticated, authLoading, navigate, id]);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      // Skip fetching if backend is not available
      if (!backendAvailable) {
        setError('Backend server is not available. Please try again later.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/posts/${id}`);
        const postData = response.data;

        // Check if user is the post owner
        if (!user || !user._id) {
          navigate('/login', { state: { from: `/edit-post/${id}` } });
          return;
        }

        if (postData.user._id !== user._id) {
          navigate(`/post/${id}`);
          return;
        }

        setPost(postData);

        // Set form data
        setFormData({
          caption: postData.caption || '',
          tags: Array.isArray(postData.tags) ? postData.tags.join(', ') : (postData.tags || ''),
          isPrivate: postData.isPrivate || false,
        });
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. Please try again.');

        // Redirect to 404 if post not found
        if (err.response && err.response.status === 404) {
          navigate('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && isBackendChecked && user) {
      fetchPost();
    }
  }, [id, navigate, backendAvailable, isBackendChecked, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!post) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Process tags if needed
      const processedData = {
        ...formData,
        // Convert tags string to array if needed
        tags: formData.tags.trim() ? formData.tags : ''
      };

      await api.put(`/posts/${id}`, processedData);

      setUpdateSuccess(true);

      // Reset success message after 2 seconds and redirect
      setTimeout(() => {
        navigate(`/post/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-center mb-8">
          Edit Post
        </h1>
        <BackendUnavailable message="The backend server is not available. Post editing will not work until the server is running." />
      </div>
    );
  }

  // Show error state
  if (error && !post) {
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
    <div className="container mx-auto px-4 py-8 text-black">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Image Preview */}
          <div className="md:w-1/2">
            {post && (
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Edit Form */}
          <div className="md:w-1/2 p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Post</h1>

            {updateSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
                Post updated successfully! Redirecting...
              </div>
            )}

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Caption */}
              <div className="mb-4">
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Caption
                </label>
                <textarea
                  id="caption"
                  name="caption"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write a caption..."
                  value={formData.caption}
                  onChange={handleChange}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.caption.length}/500 characters
                </p>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="nature, travel, food"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>

              {/* Privacy Setting */}
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Make this post private
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/post/${id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
