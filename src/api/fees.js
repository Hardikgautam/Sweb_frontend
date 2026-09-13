// src/api/fees.js — Fee Structure and Scholarships API client
import client from './client';

// ============================================================================
// Fee Structure APIs
// ============================================================================

/**
 * Fetch all fee structures.
 * @param {object} params — Optional: { academic_year: string }
 */
export async function getFees(params = {}) {
  const res = await client.get('/fees', { params });
  return res.data;
}

export async function getFee(id) {
  const res = await client.get(`/fees/${id}`);
  return res.data;
}

/**
 * Create a new fee structure row (Admin only).
 * @param {object} data
 * @param {string} token
 */
export async function createFee(data, token) {
  const res = await client.post('/fees', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Update an existing fee structure row (Admin only).
 * @param {number} id
 * @param {object} data
 * @param {string} token
 */
export async function updateFee(id, data, token) {
  const res = await client.put(`/fees/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Delete a fee structure row (Admin only).
 * @param {number} id
 * @param {string} token
 */
export async function deleteFee(id, token) {
  const res = await client.delete(`/fees/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ============================================================================
// Scholarship APIs
// ============================================================================

/**
 * Fetch active scholarships for public display.
 */
export async function getScholarships() {
  const res = await client.get('/scholarships');
  return res.data;
}

/**
 * Fetch all scholarships (including inactive ones) for admin dashboard.
 * @param {string} token
 */
export async function getAllScholarships(token) {
  const res = await client.get('/scholarships/all', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getScholarship(id) {
  const res = await client.get(`/scholarships/${id}`);
  return res.data;
}

/**
 * Create a new scholarship entry (Admin only).
 * @param {object} data
 * @param {string} token
 */
export async function createScholarship(data, token) {
  const res = await client.post('/scholarships', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Update an existing scholarship (Admin only).
 * @param {number} id
 * @param {object} data
 * @param {string} token
 */
export async function updateScholarship(id, data, token) {
  const res = await client.put(`/scholarships/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Delete a scholarship (Admin only).
 * @param {number} id
 * @param {string} token
 */
export async function deleteScholarship(id, token) {
  const res = await client.delete(`/scholarships/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
