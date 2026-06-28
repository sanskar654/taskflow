import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),

  // Register user
  register: (userData) => api.post('/auth/register', userData),

  // Get current logged-in user profile
  getMe: () => api.get('/auth/me'),
};

export const taskAPI = {
  // Get all tasks with optional filters
  getAll: (params = {}) => api.get('/tasks', { params }),

  // Get single task
  getById: (id) => api.get(`/tasks/${id}`),

  // Get stats
  getStats: () => api.get('/tasks/stats'),

  // Create task
  create: (data) => api.post('/tasks', data),

  // Update task
  update: (id, data) => api.put(`/tasks/${id}`, data),

  // Update status only (quick toggle)
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),

  // Delete single task
  delete: (id) => api.delete(`/tasks/${id}`),

  // Bulk delete
  bulkDelete: (ids) => api.delete('/tasks/bulk/delete', { data: { ids } }),
};

export default api;
