// src/api/teachers.js
import client from './client';

export async function getTeachers(params = {}) {
  const res = await client.get('/teachers', { params });
  return res.data;
}

export async function getTeacher(id) {
  const res = await client.get(`/teachers/${id}`);
  return res.data;
}

export async function createTeacher(data) {
  const res = await client.post('/teachers', data);
  return res.data;
}

export async function updateTeacher(id, data) {
  const res = await client.put(`/teachers/${id}`, data);
  return res.data;
}

export async function deleteTeacher(id) {
  const res = await client.delete(`/teachers/${id}`);
  return res.data;
}
