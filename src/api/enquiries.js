// src/api/enquiries.js
import client from './client';

export function openEnquiryModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-enquiry-modal'));
  }
}

export async function submitEnquiry(data) {
  const res = await client.post('/enquiries', data);
  return res.data;
}

export async function getEnquiries(params = {}, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.get('/enquiries', { params, headers });
  return res.data;
}

export async function deleteEnquiry(id, token) {
  const res = await client.delete(`/enquiries/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function cleanupEnquiries(token) {
  const res = await client.delete('/enquiries/cleanup?confirm=true', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
