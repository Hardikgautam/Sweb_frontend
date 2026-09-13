// src/api/newsletter.js
import client from './client';

export async function subscribeNewsletter(email) {
  const res = await client.post('/newsletter', { email });
  return res.data;
}

export async function getSubscribers(params = {}) {
  const res = await client.get('/newsletter', { params });
  return res.data;
}
