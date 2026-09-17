// src/api/analytics.js
import client from './client';

/**
 * Public ping: Log website visitor once per session.
 * Fire-and-forget; handles failures silently.
 */
export async function pingVisitor(page = window.location.pathname) {
  try {
    const res = await client.post('/visitors/ping', { page });
    return res.data;
  } catch (err) {
    // Fail silently without disturbing user experience
    console.debug('[Visitor Ping skipped/offline]', err?.message);
    return null;
  }
}

/**
 * Admin: Get admission enquiries monthly breakdown for a specific year
 * Highlights India's admission peak season (Jan-Apr).
 */
export async function getEnquiriesAnalytics(year, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = year ? { year } : {};
  const res = await client.get('/analytics/enquiries', { params, headers });
  return res.data;
}

/**
 * Admin: Get newsletter subscribers monthly metrics (new + cumulative)
 */
export async function getNewsletterAnalytics(year, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = year ? { year } : {};
  const res = await client.get('/analytics/newsletter', { params, headers });
  return res.data;
}

/**
 * Admin: Get visitor analytics (daily, monthly, yearly counts)
 */
export async function getVisitorsAnalytics(year, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = year ? { year } : {};
  const res = await client.get('/analytics/visitors', { params, headers });
  return res.data;
}

/**
 * Admin: Get paginated visitor tracking table
 */
export async function getVisitorsTable(page = 1, limit = 50, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.get('/analytics/visitors/table', {
    params: { page, limit },
    headers,
  });
  return res.data;
}
