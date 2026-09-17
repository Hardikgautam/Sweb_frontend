// src/api/knowledge.js
// Admin client for the Saraswati AI knowledge base — the corpus the chatbot
// is allowed to answer from.

import client from './client';

function headers(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listKnowledge(token, params = {}) {
  const res = await client.get('/knowledge', { params, headers: headers(token) });
  return res.data;
}

export async function createKnowledge(token, payload) {
  const res = await client.post('/knowledge', payload, { headers: headers(token) });
  return res.data;
}

export async function updateKnowledge(token, id, payload) {
  const res = await client.put(`/knowledge/${id}`, payload, { headers: headers(token) });
  return res.data;
}

export async function deleteKnowledge(token, id) {
  const res = await client.delete(`/knowledge/${id}`, { headers: headers(token) });
  return res.data;
}

/**
 * Upload a document (.pdf/.docx/.txt/.md/.csv). The backend extracts its text
 * and splits long documents into several retrieval-sized entries, returning
 * every entry it created.
 */
export async function uploadKnowledgeFile(token, file, meta = {}) {
  const form = new FormData();
  form.append('file', file);
  if (meta.title) form.append('title', meta.title);
  form.append('category', meta.category || 'general');
  if (meta.tags) form.append('tags', meta.tags);
  form.append('priority', String(meta.priority ?? 0));
  form.append('is_active', String(meta.is_active ?? true));

  const res = await client.post('/knowledge/upload', form, {
    headers: headers(token),
    timeout: 60000, // text extraction on a large PDF takes a moment
  });
  return res.data;
}

/** Dry-run a question against the corpus without spending an LLM call. */
export async function previewKnowledgeAnswer(token, question) {
  const res = await client.post('/knowledge/preview', null, {
    params: { question },
    headers: headers(token),
  });
  return res.data;
}
