// Debug token utility
// Add this to a browser console to check token status

console.log('=== Token Debug ===');
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('Token:', token ? 'Present' : 'Missing');
console.log('User:', user ? JSON.parse(user) : 'Missing');

if (token) {
  // Check token format
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      console.log('Token expires:', new Date(payload.exp * 1000));
      console.log('Token expired?', Date.now() > payload.exp * 1000);
    } else {
      console.log('Invalid token format');
    }
  } catch (e) {
    console.log('Error parsing token:', e.message);
  }
}

// Test API call
fetch('http://localhost:5002/api/tests/health', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('Health check:', data))
.catch(err => console.log('Health check error:', err));