
import axios from 'axios';

// ✅ Base URL
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token if available
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

// ✅ Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// ✅ Donor API
export const donorAPI = {
  register: (data) => api.post('/donors/register', data),
  getAll: (params = {}) => api.get('/donors/all', { params }),
  getMap: (params = {}) => api.get('/donors/map', { params }),
  getMyProfile: () => api.get('/donors/my-profile'),
  deactivate: () => api.post('/donors/deactivate'),
  getById: (id) => api.get(`/donors/${id}`),
};

// ✅ Request API
export const requestAPI = {
  create: (data) => api.post('/requests/create', data),
  getAll: (params = {}) => api.get('/requests/all', { params }),
  getMyRequests: () => api.get('/requests/my-requests'),
  fulfill: (id) => api.post(`/requests/${id}/fulfill`),
  getById: (id) => api.get(`/requests/${id}`),
  getMatchingDonors: (id) => api.get(`/requests/${id}/match-donors`),
};

// ✅ Hospital API
export const hospitalAPI = {
  getDistricts: () => api.get('/hospitals/districts'),
  getByDistrict: (district) => api.get(`/hospitals/${district}`),
  getAll: () => api.get('/hospitals/all'),
};

// ✅ Notify API
export const notifyAPI = {
  notifyDonorsForRequest: (data) => api.post('/notify/request-donors', data),
  contactDonor: (data) => api.post('/notify/contact-donor', data),
};

// ✅ Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;

