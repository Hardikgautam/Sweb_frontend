// src/api/axiosInstance.js
// Centralised Axios instance — all API files import from here.
// Set VITE_API_BASE_URL in .env (dev) or .env.production (prod) to point at the backend.

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
console.log('API_BASE_URL resolved to:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default api;
