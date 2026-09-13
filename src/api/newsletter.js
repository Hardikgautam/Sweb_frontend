// src/api/newsletter.js
import client from './client';

/**
 * Public subscription endpoint.
 * @param {string} email
 */
export async function subscribeNewsletter(email) {
  const res = await client.post('/newsletter', { email });
  return res.data;
}

/**
 * Admin endpoint: list distinct subscribers (deduplicated).
 * @param {string} token - Admin Bearer JWT
 * @param {object} params - { search: string, order: 'desc' | 'asc' }
 */
export async function getSubscribers(token, params = {}) {
  const res = await client.get('/newsletter', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Admin endpoint: delete a subscriber by ID.
 * @param {number} id
 * @param {string} token - Admin Bearer JWT
 */
export async function deleteSubscriber(id, token) {
  const res = await client.delete(`/newsletter/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
