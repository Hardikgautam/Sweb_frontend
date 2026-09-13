// src/api/health.js
// Calls the backend health-check endpoint.

import api from './axiosInstance';

/**
 * Ping the API and return the status message.
 * @returns {Promise<{ status: string, message: string }>}
 */
export async function checkHealth() {
  const response = await api.get('/api/health');
  return response.data;
}
