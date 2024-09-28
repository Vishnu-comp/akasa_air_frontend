import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('Request headers:', config.headers);
  } else {
    console.log('No token found in localStorage');
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response && error.response.status === 403) {
    console.log('Received 403 Forbidden error. Headers:', error.config.headers);
  }
  return Promise.reject(error);
});

export default api;