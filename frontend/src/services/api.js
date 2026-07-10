import axios from 'axios';

// Create api instance with default options
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach credentials or headers here
api.interceptors.request.use(
  (config) => {
    // Example placeholder: attach authorization token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error status interception
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.warn('Unauthorized. Session might have expired.');
      } else if (status === 403) {
        console.error('Forbidden action.');
      } else if (status === 500) {
        console.error('Internal Server Error.');
      }
    } else {
      console.error('Network error or server unreachable.');
    }
    return Promise.reject(error);
  }
);

export default api;
