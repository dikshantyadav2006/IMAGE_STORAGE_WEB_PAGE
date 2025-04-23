import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
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

  // Check if user is logged in
  const checkAuth = async () => {
    if (initialized) return; // Prevent multiple checks

    setLoading(true);

    // First check if backend is available
    const isBackendAvailable = await checkBackendAvailability();

    if (!isBackendAvailable) {
      console.warn('Backend server is not available. Authentication features will not work.');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const response = await api.get('/auth/userdata');
      setUser(response.data);
      console.log('User data:', response);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    // Check if backend is available
    const isBackendAvailable = await checkBackendAvailability();

    if (!isBackendAvailable) {
      setError('Backend server is not available. Please try again later.');
      setLoading(false);
      throw new Error('Backend server is not available');
    }

    try {
      const response = await api.post('/auth/login', credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setInitialized(true);
      return response.data;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    console.log('Registering user:', userData);
    setLoading(true);
    setError(null);

    // Check if backend is available
    const isBackendAvailable = await checkBackendAvailability();

    if (!isBackendAvailable) {
      setError('Backend server is not available. Please try again later.');
      setLoading(false);
      throw new Error('Backend server is not available');
    }

    try {
      const response = await api.post('/auth/signup', userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setInitialized(true);
      return response.data;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);

    // Check if backend is available
    const isBackendAvailable = await checkBackendAvailability();

    // Even if backend is not available, we can still log out locally
    try {
      if (isBackendAvailable) {
        await api.post('/auth/logout');
      }
      // Always clear user data locally regardless of backend availability
      setUser(null);
      setIsAuthenticated(false);
      // Don't reset initialized state to prevent re-checking auth
    } catch (err) {
      console.error('Logout failed:', err);
      // Still clear user data locally even if logout request fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (userId, userData) => {
    setLoading(true);
    setError(null);

    // Check if backend is available
    const isBackendAvailable = await checkBackendAvailability();

    if (!isBackendAvailable) {
      setError('Backend server is not available. Please try again later.');
      setLoading(false);
      throw new Error('Backend server is not available');
    }

    try {
      const response = await api.put(`/user/edit-user/${userId}`, userData);
      setUser(prev => ({ ...prev, ...response.data.user }));
      return response.data;
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file) => {
    setLoading(true);
    setError(null);

    // Check if backend is available
    const isBackendAvailable = await checkBackendAvailability();

    if (!isBackendAvailable) {
      setError('Backend server is not available. Please try again later.');
      setLoading(false);
      throw new Error('Backend server is not available');
    }

    try {
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await api.post('/profile/upload-profile-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(prev => ({
        ...prev,
        profilePic: response.data.profilePic,
      }));

      return response.data;
    } catch (err) {
      console.error('Profile picture upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload profile picture');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user profile by username
  const getUserProfile = async (username) => {
    // Check if backend is available
    const isBackendAvailable = await checkBackendAvailability();

    if (!isBackendAvailable) {
      console.warn('Backend server is not available. Cannot fetch user profile.');
      throw new Error('Backend server is not available');
    }

    try {
      const response = await api.get(`/profile/${username}`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      throw err;
    }
  };

  // Check if user is authenticated on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        backendAvailable,
        checkBackendAvailability,
        login,
        register,
        logout,
        updateProfile,
        uploadProfilePicture,
        getUserProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
