import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
};

export const testimonialsAPI = {
  getTestimonials: (params) => api.get('/api/testimonials', { params }),
  getTestimonial: (id) => api.get(`/api/testimonials/${id}`),
  createTestimonial: (data) => api.post('/api/testimonials', data),
  updateTestimonial: (id, data) => api.put(`/api/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/api/testimonials/${id}`),
  approveTestimonial: (id) => api.post(`/api/testimonials/${id}/approve`),
};

export const linksAPI = {
  getLinks: () => api.get('/api/links'),
  getLink: (id) => api.get(`/api/links/${id}`),
  createLink: (data) => api.post('/api/links', data),
  updateLink: (id, data) => api.put(`/api/links/${id}`, data),
  deleteLink: (id) => api.delete(`/api/links/${id}`),
};

export const templatesAPI = {
  getTemplates: () => api.get('/api/templates'),
  getTemplate: (id) => api.get(`/api/templates/${id}`),
  createTemplate: (data) => api.post('/api/templates', data),
  updateTemplate: (id, data) => api.put(`/api/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/api/templates/${id}`),
};

export const uploadsAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });
    return api.post('/api/uploads/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const publicAPI = {
  getPublicLink: (slug) => api.get(`/t/${slug}`),
};

export const dashboardAPI = {
  getOverview: () => api.get('/api/dashboard/overview'),
  getSpaces: (params) => api.get('/api/dashboard/spaces', { params }),
  getSpace: (id) => api.get(`/api/dashboard/spaces/${id}`),
  createSpace: (data) => api.post('/api/dashboard/spaces', data),
  debugSpace: (data) => api.post('/api/dashboard/spaces/debug', data),
  updateSpace: (id, data) => api.put(`/api/dashboard/spaces/${id}`, data),
  deleteSpace: (id) => api.delete(`/api/dashboard/spaces/${id}`),
  
  // Space Detail API
  getSpaceDetail: (spaceId) => api.get(`/api/spaces/${spaceId}`),
  getSpaceTestimonials: (spaceId, params) => api.get(`/api/spaces/${spaceId}/testimonials`, { params }),
  createTestimonial: (spaceId, data) => api.post(`/api/spaces/${spaceId}/testimonials`, data),
  updateTestimonial: (spaceId, testimonialId, data) => api.put(`/api/spaces/${spaceId}/testimonials/${testimonialId}`, data),
  actionTestimonial: (spaceId, testimonialId, action) => api.post(`/api/spaces/${spaceId}/testimonials/${testimonialId}/actions`, { action }),
  bulkActionTestimonials: (spaceId, testimonialIds, action) => api.post(`/api/spaces/${spaceId}/testimonials/bulk`, { testimonialIds, action }),
  bulkImportTestimonials: (spaceId, formData) => api.post(`/api/spaces/${spaceId}/testimonials/bulk`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSpaceIntegrations: (spaceId) => api.get(`/api/spaces/${spaceId}/integrations`),
  connectIntegration: (spaceId, integrationId) => api.post(`/api/spaces/${spaceId}/integrations/${integrationId}/connect`),
  
  // Widget API
  createWidget: (spaceId, data) => api.post(`/api/spaces/${spaceId}/widgets`, data),
  getWidgets: (spaceId) => api.get(`/api/spaces/${spaceId}/widgets`),
  getWidgetPreview: (widgetId) => api.get(`/api/widgets/${widgetId}/preview`),
  updateWidget: (widgetId, data) => api.put(`/api/widgets/${widgetId}`, data),
  deleteWidget: (widgetId) => api.delete(`/api/widgets/${widgetId}`),
};

export const shareLinksAPI = {
  getPublicShareLink: (spaceId) => api.get(`/s/${spaceId}`),
  submitPublicTestimonial: (spaceId, data) => {
    // If data is FormData, send as multipart/form-data
    if (data instanceof FormData) {
      return api.post(`/s/${spaceId}/submissions`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    // Otherwise send as JSON
    return api.post(`/s/${spaceId}/submissions`, data);
  },
};

export default api;
