import { create } from 'zustand';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const useAdminStore = create((set, get) => ({
  token: localStorage.getItem('admin_token') || null,
  adminName: localStorage.getItem('admin_name') || '',
  candidates: [],
  stats: null,
  analytics: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      const { token, name } = res.data;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_name', name);
      set({ token, adminName: name, loading: false });
      return true;
    } catch (e) {
      set({ error: 'Invalid credentials', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    set({ token: null, adminName: '', candidates: [], stats: null });
  },

  fetchCandidates: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`${API}/api/admin/candidates?${params}`, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      set({ candidates: res.data.candidates, loading: false });
    } catch (e) {
      set({ error: 'Failed to load candidates', loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await axios.get(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      set({ stats: res.data });
    } catch (e) {
      console.error('Failed to load stats');
    }
  },

  fetchAnalytics: async () => {
    try {
      const res = await axios.get(`${API}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      set({ analytics: res.data });
    } catch (e) {
      console.error('Failed to load analytics');
    }
  },

  updateStatus: async (candidateId, status, notes = '') => {
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('notes', notes);
      await axios.put(`${API}/api/admin/candidates/${candidateId}/status`, formData, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      // Refresh candidates
      await get().fetchCandidates();
      return true;
    } catch (e) {
      return false;
    }
  }
}));

export default useAdminStore;
