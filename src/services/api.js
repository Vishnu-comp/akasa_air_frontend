import axios from 'axios';

const api = axios.create({
  baseURL: 'https://akasa-air-backend-1.onrender.com',
});

// Request Interceptor
api.interceptors.request.use(config => {
  // Check if the request URL includes '/api/inventory'
  if (!config.url.includes('/api/inventory')) {
    // Only add the token for non-inventory requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Request headers with token:', config.headers);
    } else {
      console.log('No token found in localStorage');
    }
  } else {
    // For inventory routes, no token will be added
    console.log('Skipping token for inventory management request.');
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response && error.response.status === 403) {
    console.log('Received 403 Forbidden error. Headers:', error.config.headers);
  }
  return Promise.reject(error);
});

export default api;
