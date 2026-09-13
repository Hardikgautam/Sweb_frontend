// src/api/ebooks.js
import client from './client';

export async function getEbooks(params = {}, options = {}) {
  const res = await client.get('/ebooks', { params, ...options });
  return res.data;
}

export async function getEbookClasses(options = {}) {
  const res = await client.get('/ebooks/classes', options);
  return res.data;
}

export async function getEbookSubjects(params = {}, options = {}) {
  const res = await client.get('/ebooks/subjects', { params, ...options });
  return res.data;
}

export async function getEbook(id) {
  const res = await client.get(`/ebooks/${id}`);
  return res.data;
}

export async function createEbook(data) {
  const res = await client.post('/ebooks', data);
  return res.data;
}

export async function updateEbook(id, data) {
  const res = await client.put(`/ebooks/${id}`, data);
  return res.data;
}

export async function deleteEbook(id) {
  const res = await client.delete(`/ebooks/${id}`);
  return res.data;
}

export function getEbookDownloadUrl(id) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  return `${base}/ebooks/${id}/download`;
}

export function getEbookCoverUrl(id) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  return `${base}/ebooks/${id}/cover`;
}
