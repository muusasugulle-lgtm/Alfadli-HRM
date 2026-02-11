import axios from 'axios';

// Use /api proxy in development (Vite will proxy to backend), or direct URL in production
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors - DON'T auto-logout, let the component handle it
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-logout on 401 - let the useAuth hook handle it
    // Only redirect if we're NOT already on the login page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Check if the error is from a protected route, not login itself
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        console.log('Session expired, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
