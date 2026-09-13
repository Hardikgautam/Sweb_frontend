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

export async function getEnquiries(params = {}) {
  const res = await client.get('/enquiries', { params });
  return res.data;
}

