// src/api/subjects.js
import client from './client';

export async function getSubjects(params = {}) {
  const res = await client.get('/subjects', { params });
  return res.data;
}

export async function getSubject(id) {
  const res = await client.get(`/subjects/${id}`);
  return res.data;
}

export async function createSubject(data) {
  const res = await client.post('/subjects', data);
  return res.data;
}

export async function updateSubject(id, data) {
  const res = await client.put(`/subjects/${id}`, data);
  return res.data;
}

export async function deleteSubject(id) {
  const res = await client.delete(`/subjects/${id}`);
  return res.data;
}
