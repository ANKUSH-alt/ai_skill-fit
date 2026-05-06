import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Candidate API
export const candidateAPI = {
  register: async (formData) => {
    const response = await api.post('/candidate/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  checkPhone: async (phone) => {
    const response = await api.get(`/candidate/check-phone/${phone}`);
    return response.data;
  }
};

// Interview API
export const interviewAPI = {
  getNextQuestion: async (sessionId) => {
    const response = await api.get(`/interview/${sessionId}/next-question`);
    return response.data;
  },
  
  submitResponse: async (sessionId, questionId, videoBlob) => {
    const formData = new FormData();
    formData.append('video', videoBlob);
    formData.append('question_id', questionId);
    
    const response = await api.post(`/interview/${sessionId}/submit-response`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  complete: async (sessionId) => {
    const response = await api.post(`/interview/${sessionId}/complete`);
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  getCandidates: async (filters = {}) => {
    const response = await api.get('/admin/candidates', { params: filters });
    return response.data;
  },
  
  getCandidateDetail: async (id) => {
    const response = await api.get(`/admin/candidates/${id}/full-report`);
    return response.data;
  },
  
  updateStatus: async (id, status, notes) => {
    const response = await api.put(`/admin/candidates/${id}/status`, { status, notes });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  }
};

export default api;
