import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [backendAvailable, setBackendAvailable] = useState(true);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Create axios instance with credentials
  const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
  });

  // Check if backend is available
  const checkBackendAvailability = async () => {
    try {
      await api.get('/');
      setBackendAvailable(true);
      return true;
    } catch (err) {
      console.warn('Backend server may not be running:', err.message);
      setBackendAvailable(false);
      return false;
    }
  };

  // Fetch posts for the explore feed
  const fetchPosts = async (page = 1) => {
    setLoading(true);
    setError(null);

    // Check if backend is available
    const isAvailable = await checkBackendAvailability();
    if (!isAvailable) {
      setError('Backend server is not available. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/posts/explore?page=${page}&limit=12`);

      if (page === 1) {
        setPosts(response.data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(response.data.posts || [])]);
      }

      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts by a specific user
  const fetchUserPosts = async (userId, page = 1) => {
    setLoading(true);
    setError(null);

    // Check if backend is available
    const isAvailable = await checkBackendAvailability();
    if (!isAvailable) {
      setError('Backend server is not available. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/posts/user/${userId}?page=${page}&limit=12`);

      if (page === 1) {
        setUserPosts(response.data.posts || []);
      } else {
        setUserPosts(prev => [...prev, ...(response.data.posts || [])]);
      }

      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (postData) => {
    setLoading(true);
    setError(null);

    // Check if backend is available
    const isAvailable = await checkBackendAvailability();
    if (!isAvailable) {
      setError('Backend server is not available. Please try again later.');
      setLoading(false);
      throw new Error('Backend server is not available');
    }

    try {
      const formData = new FormData();
      formData.append('image', postData.image);
      formData.append('caption', postData.caption);

      if (postData.tags) {
        formData.append('tags', postData.tags);
      }

      if (postData.isPrivate !== undefined) {
        formData.append('isPrivate', postData.isPrivate);
      }

      const response = await api.post('/posts/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add the new post to the beginning of the posts array
      setPosts(prev => [response.data.post, ...prev]);
      setUserPosts(prev => [response.data.post, ...prev]);

      return response.data.post;
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a post
  const deletePost = async (postId) => {
    setLoading(true);
    setError(null);

    // Check if backend is available
    const isAvailable = await checkBackendAvailability();
    if (!isAvailable) {
      setError('Backend server is not available. Please try again later.');
      setLoading(false);
      throw new Error('Backend server is not available');
    }

    try {
      await api.delete(`/posts/${postId}`);

      // Remove the deleted post from the posts array
      setPosts(prev => prev.filter(post => post._id !== postId));
      setUserPosts(prev => prev.filter(post => post._id !== postId));

      return { success: true };
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Like or unlike a post
  const toggleLike = async (postId) => {
    // Check if backend is available
    const isAvailable = await checkBackendAvailability();
    if (!isAvailable) {
      throw new Error('Backend server is not available');
    }

    try {
      const response = await api.post(`/posts/${postId}/like`);

      // Update the post in both posts arrays
      const updatePostLikes = (postsArray) => {
        return postsArray.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              likes: response.data.liked
                ? [...post.likes, response.data.userId]
                : post.likes.filter(id => id !== response.data.userId),
            };
          }
          return post;
        });
      };

      setPosts(updatePostLikes);
      setUserPosts(updatePostLikes);

      return response.data;
    } catch (err) {
      console.error('Error toggling like:', err);
      throw err;
    }
  };

  // Add a comment to a post
  const addComment = async (postId, text) => {
    // Check if backend is available
    const isAvailable = await checkBackendAvailability();
    if (!isAvailable) {
      throw new Error('Backend server is not available');
    }

    try {
      const response = await api.post(`/posts/${postId}/comment`, { text });

      // Update the post in both posts arrays
      const updatePostComments = (postsArray) => {
        return postsArray.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, response.data.comment],
            };
          }
          return post;
        });
      };

      setPosts(updatePostComments);
      setUserPosts(updatePostComments);

      return response.data.comment;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  // Search posts
  const searchPosts = async (query, page = 1) => {
    setLoading(true);
    setError(null);

    // Check if backend is available
    const isAvailable = await checkBackendAvailability();
    if (!isAvailable) {
      setError('Backend server is not available. Please try again later.');
      setLoading(false);
      throw new Error('Backend server is not available');
    }

    try {
      const response = await api.get(`/posts/search?query=${query}&page=${page}&limit=12`);

      if (page === 1) {
        setPosts(response.data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(response.data.posts || [])]);
      }

      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);

      return response.data;
    } catch (err) {
      console.error('Error searching posts:', err);
      setError('Failed to search posts. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load more posts (pagination)
  const loadMorePosts = () => {
    if (currentPage < totalPages && !loading) {
      fetchPosts(currentPage + 1);
    }
  };

  // Load more user posts (pagination)
  const loadMoreUserPosts = (userId) => {
    if (currentPage < totalPages && !loading) {
      fetchUserPosts(userId, currentPage + 1);
    }
  };

  // Clear posts when component unmounts or user logs out
  const clearPosts = () => {
    setPosts([]);
    setUserPosts([]);
    setCurrentPage(1);
    setTotalPages(1);
  };

  // Initialize by checking backend availability and fetching posts
  useEffect(() => {
    const init = async () => {
      const isAvailable = await checkBackendAvailability();
      if (isAvailable) {
        fetchPosts();
      } else {
        setLoading(false);
        setError('Backend server is not available. Please make sure the server is running.');
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PostContext.Provider
      value={{
        posts,
        userPosts,
        loading,
        error,
        currentPage,
        totalPages,
        backendAvailable,
        checkBackendAvailability,
        fetchPosts,
        fetchUserPosts,
        createPost,
        deletePost,
        toggleLike,
        addComment,
        searchPosts,
        loadMorePosts,
        loadMoreUserPosts,
        clearPosts,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);
