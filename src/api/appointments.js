// src/api/appointments.js — Appointments API client
import client from './client';

/**
 * Public: Submit a campus appointment/visit booking.
 * @param {object} data
 */
export async function submitAppointment(data) {
  const res = await client.post('/appointments', data);
  return res.data;
}

/**
 * Admin: Fetch all appointments with optional filters and sorting.
 * @param {object} params — { search, status, sort_by, order, skip, limit }
 * @param {string} token
 */
export async function getAppointments(params = {}, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.get('/appointments', { params, headers });
  return res.data;
}

/**
 * Admin: Fetch appointment statistics (counts by status).
 * @param {string} token
 */
export async function getAppointmentStats(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.get('/appointments/stats', { headers });
  return res.data;
}

/**
 * Admin: Update appointment status, confirmed slot, and admin notes.
 * @param {number} id
 * @param {object} data — { status, admin_notes, confirmed_date, confirmed_time }
 * @param {string} token
 */
export async function updateAppointment(id, data, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.patch(`/appointments/${id}`, data, { headers });
  return res.data;
}

/**
 * Admin: Delete an appointment.
 * @param {number} id
 * @param {string} token
 */
export async function deleteAppointment(id, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.delete(`/appointments/${id}`, { headers });
  return res.data;
}
