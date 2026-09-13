// src/api/axiosInstance.js
// Centralised Axios instance — all API files import from here.
// Set VITE_API_BASE_URL in .env (dev) or .env.production (prod) to point at the backend.

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
