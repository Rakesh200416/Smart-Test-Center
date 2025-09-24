// Token cleanup utility to handle invalid tokens
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('🧹 Auth data cleared');
};

export const isTokenValid = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // Basic token format validation
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.log('⚠️ Token format invalid, clearing...');
    clearAuthData();
    return false;
  }
  
  try {
    // Test token with a simple API call
    const response = await fetch('http://localhost:5002/api/tests/health', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401) {
      console.log('⚠️ Token invalid (401), clearing...');
      clearAuthData();
      return false;
    }
    
    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    clearAuthData();
    return false;
  }
};

export const refreshAuthState = () => {
  // Force a page reload to refresh auth context
  window.location.reload();
};

// Auto-clear invalid tokens on app startup
export const validateTokenOnStartup = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('⚠️ Invalid token format detected on startup, clearing...');
      clearAuthData();
      alert('Your login session is invalid. Please login again.');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
  }
};