import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure Backend URLs
const LOCAL_API = 'http://localhost:8000/api';
const NGROK_API = 'https://predatorily-nonfelonious-ranae.ngrok-free.dev/api';

// Dynamically determine which API to use
// Dynamic API URL for production and development
const getBaseURL = () => {
  // 1. Highest Priority: Vercel/Vite Environment Variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Fallback for Local Development
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000/api';
    }
  }

  // 3. Last Resort: Default Ngrok (For mobile/cross-device testing)
  return 'https://predatorily-nonfelonious-ranae.ngrok-free.dev/api';
};

axios.defaults.baseURL = getBaseURL();
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

console.log('AuthContext: Using API BaseURL:', axios.defaults.baseURL);

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('ccs_user');
    const token = localStorage.getItem('ccs_token');
    
    if (storedUser && token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch fresh user data with full profile
      axios.get('/profile').then(res => {
        setUser(res.data);
        localStorage.setItem('ccs_user', JSON.stringify(res.data));
      }).catch((err) => {
        console.warn('Silent profile fetch failed:', err.message);
        setUser(JSON.parse(storedUser));
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (userData) => {
    try {
      const res = await axios.post('/register', userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      const userRes = await axios.get('/profile');
      setUser(userRes.data);
      localStorage.setItem('ccs_user', JSON.stringify(userRes.data));
      localStorage.setItem('ccs_token', res.data.token);
      return { success: true, user: userRes.data };
    } catch (err) {
      console.error('Registration Error Details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    console.log(`Attempting login for: ${email} to ${axios.defaults.baseURL}`);
    try {
      const res = await axios.post('/login', { email, password });
      console.log('Login request success, token received.');
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      const userRes = await axios.get('/profile');
      console.log('Profile fetch success:', userRes.data.name);

      setUser(userRes.data);
      localStorage.setItem('ccs_user', JSON.stringify(userRes.data));
      localStorage.setItem('ccs_token', res.data.token);
      return { success: true, user: userRes.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      console.error('Login Error Details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: `${axios.defaults.baseURL}/login`
      });
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('ccs_token')) {
        await axios.post('/logout');
      }
    } catch (err) {
      console.error(err);
    } finally {
        setUser(null);
        localStorage.removeItem('ccs_user');
        localStorage.removeItem('ccs_token');
        delete axios.defaults.headers.common['Authorization'];
    }
  };

  const updateUser = (newDetails) => {
    const updatedUser = { ...user, ...newDetails };
    setUser(updatedUser);
    localStorage.setItem('ccs_user', JSON.stringify(updatedUser));
  };

  // Calls the backend and keeps local state in sync
  const updateProfile = async (minorChanges = {}, majorChanges = {}, studentProfile = {}) => {
    try {
      const res = await axios.post('/profile/update', { minorChanges, majorChanges, studentProfile });
      // Re-fetch fresh user data from the server
      const meRes = await axios.get('/profile');
      updateUser(meRes.data);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Update failed' };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};