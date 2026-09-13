// src/api/client.js
// Centralized Axios client instance for all API calls.
// Set VITE_API_BASE_URL in .env (dev) or .env.production (prod) to point at the backend.

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
console.log('Vite MODE resolved to:', import.meta.env.MODE);
console.log('API_BASE_URL resolved to:', API_BASE_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to unwrap data and handle network errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Expected AbortController cancellation on filter change or component unmount
    if (axios.isCancel(error) || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error?.response?.status,
      data: error?.response?.data,
      url: error?.config?.url,
      params: error?.config?.params,
    };
    console.error('[API Client Error]', errorDetails);
    return Promise.reject(error);
  }
);

export default client;
