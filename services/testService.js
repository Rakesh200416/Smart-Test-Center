import axios from 'axios';

const API_URL = 'http://localhost:5004/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const testService = {
  // Get all available tests
  getAllTests: () => {
    return axios.get(`${API_URL}/tests`, getAuthHeaders());
  },

  // Get specific test by ID
  getTestById: (testId) => {
    return axios.get(`${API_URL}/tests/${testId}`, getAuthHeaders());
  },

  // Create new test
  createTest: (testData) => {
    return axios.post(`${API_URL}/tests`, testData, getAuthHeaders());
  },

  // Submit test answers
  submitTest: (submissionData) => {
    return axios.post(`${API_URL}/test-results`, submissionData, getAuthHeaders());
  },

  // Get user's test results
  getMyResults: () => {
    return axios.get(`${API_URL}/test-results/my-results`, getAuthHeaders());
  },

  // Generate AI performance report
  generateAIReport: (resultId) => {
    return axios.post(`${API_URL}/test-results/${resultId}/ai-report`, {}, getAuthHeaders());
  },
};
