// Immediate token validation script
// Run this to check and clear invalid tokens immediately

(function() {
    'use strict';
    
    function clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('🧹 Auth data cleared due to invalid token');
    }
    
    function validateToken() {
        const token = localStorage.getItem('token');
        if (token) {
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.warn('⚠️ Invalid token format detected, clearing...');
                clearAuthData();
                alert('Your login session is invalid. Please login again.');
                if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                    window.location.href = '/login';
                }
                return false;
            }
        }
        return true;
    }
    
    // Run immediately
    validateToken();
    
    // Also run when localStorage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'token') {
            validateToken();
        }
    });
    
})();