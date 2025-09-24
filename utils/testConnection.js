// Simple utility to test authentication
import api from '../utils/api';

export const testConnection = async () => {
  try {
    const response = await api.get('/tests/health');
    console.log('✅ Server connection working:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    return false;
  }
};

export const testAuth = async () => {
  try {
    const response = await api.get('/auth/me');
    console.log('✅ Authentication working:', response.data.user);
    return response.data.user;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return null;
  }
};