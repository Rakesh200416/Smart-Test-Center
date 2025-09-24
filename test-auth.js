// Test authentication endpoint
const axios = require('axios');

const testAuth = async () => {
  try {
    // Test with no token
    console.log('Testing without token...');
    const response1 = await axios.post('http://localhost:5002/api/tests', {
      name: 'Test',
      questions: [{ question: 'Test?', options: ['A', 'B'], correctOption: 'A', marks: 1 }]
    });
    console.log('No token result:', response1.data);
  } catch (error) {
    console.log('No token error:', error.response?.status, error.response?.data);
  }

  try {
    // Test with invalid token
    console.log('\nTesting with invalid token...');
    const response2 = await axios.post('http://localhost:5002/api/tests', 
      {
        name: 'Test',
        questions: [{ question: 'Test?', options: ['A', 'B'], correctOption: 'A', marks: 1 }]
      },
      {
        headers: { Authorization: 'Bearer invalid_token_here' }
      }
    );
    console.log('Invalid token result:', response2.data);
  } catch (error) {
    console.log('Invalid token error:', error.response?.status, error.response?.data);
  }
};

testAuth();