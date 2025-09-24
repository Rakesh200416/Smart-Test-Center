import axios from 'axios';
import { clearAuthData } from './tokenCleanup';

const api = axios.create({
  baseURL: 'http://localhost:5004/api', // Updated to match the new backend port
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add response interceptor to handle token errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error Debug:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      hasResponse: !!error.response,
      hasRequest: !!error.request,
      errorMessage: error.message
    });
    
    const status = error.response?.status;
    const message = error.response?.data?.message;
    
    if (status === 401) {
      console.warn('🔒 Authentication failed:', message);
      clearAuthData();
      
      // Show specific error message
      if (message === 'Token is not valid') {
        alert('Your login session is invalid. Please login again.');
      } else if (message === 'Token has expired') {
        alert('Your login session has expired. Please login again.');
      } else {
        alert('Authentication failed. Please login again.');
      }
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      
      // Return a resolved promise with a specific error to prevent further error handling
      return Promise.reject(new Error('AUTHENTICATION_HANDLED'));
    } else if (status === 403) {
      alert('You do not have permission to perform this action.');
    }
    
    return Promise.reject(error);
  }
);

export default api;