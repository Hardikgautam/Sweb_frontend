// src/api/chat.js
// Saraswati AI chat client — public visitor endpoints plus the admin inbox.

import client from './client';

const TOKEN_KEY = 'saraswati_token';
const USER_KEY = 'saraswati_user';
const GUEST_KEY = 'saraswati_guest_key';

// ── Local identity ──────────────────────────────────────────────────────────

/**
 * A stable per-browser key so an anonymous visitor's thread survives reloads.
 * Signing in hands this to the backend, which adopts the guest conversation
 * instead of orphaning it.
 */
export function getGuestKey() {
  try {
    let key = localStorage.getItem(GUEST_KEY);
    if (!key) {
      // Backend accepts /^[A-Za-z0-9_-]{8,64}$/.
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      key = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(GUEST_KEY, key);
    }
    return key;
  } catch {
    // Private mode with storage blocked: fall back to a per-session key so the
    // widget still works, it just won't persist across reloads.
    return `g${Math.random().toString(36).slice(2, 14)}`;
  }
}

export function getChatToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function getStoredChatUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable — session lives in memory for this page only */
  }
}

export function clearChatSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Authorization header when signed in, empty object otherwise. */
function authHeaders() {
  const token = getChatToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Public endpoints ────────────────────────────────────────────────────────

export async function getChatConfig() {
  const res = await client.get('/chat/config');
  return res.data;
}

export async function signInWithGoogle(credential) {
  const res = await client.post('/chat/auth/google', {
    credential,
    guest_key: getGuestKey(),
  });
  storeSession(res.data.token, res.data.user);
  return res.data;
}

export async function getChatHistory(limit) {
  const params = { guest_key: getGuestKey() };
  if (limit) params.limit = limit;
  const res = await client.get('/chat/history', { params, headers: authHeaders() });
  return res.data;
}

export async function sendChatMessage(message) {
  const res = await client.post(
    '/chat/message',
    { message, guest_key: getGuestKey() },
    // Answer generation can involve an upstream model call.
    { headers: authHeaders(), timeout: 45000 },
  );
  return res.data;
}

export async function requestHumanHelp(payload = {}) {
  const res = await client.post(
    '/chat/request-human',
    { ...payload, guest_key: getGuestKey() },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function markChatRead() {
  const res = await client.post('/chat/mark-read', null, {
    params: { guest_key: getGuestKey() },
    headers: authHeaders(),
  });
  return res.data;
}

// ── Admin endpoints ─────────────────────────────────────────────────────────

function adminHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getEngineStatus(token) {
  const res = await client.get('/chat/admin/status', { headers: adminHeaders(token) });
  return res.data;
}

export async function listConversations(token, params = {}) {
  const res = await client.get('/chat/admin/conversations', {
    params,
    headers: adminHeaders(token),
  });
  return res.data;
}

export async function getConversation(token, id) {
  const res = await client.get(`/chat/admin/conversations/${id}`, {
    headers: adminHeaders(token),
  });
  return res.data;
}

export async function replyToConversation(token, id, message, resolve = false) {
  const res = await client.post(
    `/chat/admin/conversations/${id}/reply`,
    { message, resolve },
    { headers: adminHeaders(token) },
  );
  return res.data;
}

export async function resolveConversation(token, id) {
  const res = await client.post(`/chat/admin/conversations/${id}/resolve`, null, {
    headers: adminHeaders(token),
  });
  return res.data;
}
