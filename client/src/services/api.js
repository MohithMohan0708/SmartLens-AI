import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const notesAPI = {
  upload: (formData) => api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAllNotes: () => api.get('/notes/'),
  getNoteById: (noteId) => api.get(`/notes/note/${noteId}`),
  deleteNote: (noteId) => api.delete(`/notes/note/${noteId}`),
};

export const settingsAPI = {
  updateProfile: (data) => api.put('/settings/profile', data),
  changePassword: (data) => api.put('/settings/password', data),
  deleteAccount: (data) => api.delete('/settings/account', { data }),
};

export default api;
