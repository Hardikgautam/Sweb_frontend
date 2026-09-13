// src/api/holidays.js — Holiday and Vacation API client
import client from './client';

/**
 * Fetch holidays sorted by start_date ascending.
 * @param {object} params — Optional: { year: number, search: string }
 */
export async function getHolidays(params = {}) {
  const res = await client.get('/holidays', { params });
  return res.data;
}

export async function getHoliday(id) {
  const res = await client.get(`/holidays/${id}`);
  return res.data;
}

/**
 * Create a new holiday or date range. Requires admin JWT.
 * @param {{ name: string, start_date: string, end_date?: string, type?: string, description?: string }} data
 * @param {string} token
 */
export async function createHoliday(data, token) {
  const res = await client.post('/holidays', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Update an existing holiday or date range. Requires admin JWT.
 * @param {number} id
 * @param {object} data
 * @param {string} token
 */
export async function updateHoliday(id, data, token) {
  const res = await client.put(`/holidays/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Delete a holiday. Requires admin JWT.
 * @param {number} id
 * @param {string} token
 */
export async function deleteHoliday(id, token) {
  const res = await client.delete(`/holidays/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
