// src/api/events.js
import client from './client';

export async function getEvents(params = {}) {
  const res = await client.get('/events', { params });
  return res.data;
}

export async function getEvent(id) {
  const res = await client.get(`/events/${id}`);
  return res.data;
}

export async function createEvent(data, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.post('/events', data, { headers });
  return res.data;
}

export async function updateEvent(id, data, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.put(`/events/${id}`, data, { headers });
  return res.data;
}

export async function deleteEvent(id, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.delete(`/events/${id}`, { headers });
  return res.data;
}

