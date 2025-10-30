import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
};

export default api;
