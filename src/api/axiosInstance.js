// src/api/axiosInstance.js
// Centralised Axios instance — all API files import from here.
// Change the baseURL in one place if the backend port changes.

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
