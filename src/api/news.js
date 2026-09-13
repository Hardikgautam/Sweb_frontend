// src/api/news.js — News API client
// Public functions: getNews (with optional search), getNewsItem
// Admin functions: createNewsArticle, updateNewsArticle, deleteNewsArticle, uploadNewsImage
//
// Admin endpoints require an Authorization header:
//   import axios from 'axios';
//   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
// Or pass { headers: { Authorization: `Bearer ${token}` } } in the options.

import client from './client';

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

/**
 * Fetch all news articles, sorted pinned-first then newest-first.
 * @param {object} params  - Optional: { search: string, skip: number, limit: number }
 */
export async function getNews(params = {}) {
  const res = await client.get('/news', { params });
  return res.data;
}

/**
 * Fetch a single news article by ID.
 * @param {number} id
 */
export async function getNewsItem(id) {
  const res = await client.get(`/news/${id}`);
  return res.data;
}

// ---------------------------------------------------------------------------
// Admin routes — multipart/form-data with image upload
// ---------------------------------------------------------------------------

/**
 * Create a news article with an image.  Requires admin JWT.
 *
 * @param {{ title: string, description: string, is_pinned?: boolean, image: File }} data
 * @param {string} token  — JWT token from POST /api/admin/login
 */
export async function createNewsArticle({ title, description, is_pinned = false, image }, token) {
  const form = new FormData();
  form.append('title', title);
  form.append('description', description);
  form.append('is_pinned', String(is_pinned));
  form.append('image', image);

  const res = await client.post('/news', form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

/**
 * Update a news article.  All fields except `id` are optional.
 * Pass `image: File` to replace the Cloudinary image (old one is deleted server-side).
 *
 * @param {number} id
 * @param {{ title?: string, description?: string, is_pinned?: boolean, image?: File }} data
 * @param {string} token  — JWT token
 */
export async function updateNewsArticle(id, { title, description, is_pinned, image } = {}, token) {
  const form = new FormData();
  if (title !== undefined)      form.append('title',       title);
  if (description !== undefined) form.append('description', description);
  if (is_pinned !== undefined)  form.append('is_pinned',   String(is_pinned));
  if (image)                    form.append('image',        image);

  const res = await client.put(`/news/${id}`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

/**
 * Delete a news article (also deletes Cloudinary image).  Requires admin JWT.
 *
 * @param {number} id
 * @param {string} token  — JWT token
 */
export async function deleteNewsArticle(id, token) {
  const res = await client.delete(`/news/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Upload an image to Cloudinary and get back { image_url, public_id }.
 * Use this if you want to upload the image before creating/updating the record.
 *
 * @param {File} file
 * @param {string} token  — JWT token
 */
export async function uploadNewsImage(file, token) {
  const form = new FormData();
  form.append('file', file);

  const res = await client.post('/news/upload-image', form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // { image_url, public_id }
}

/**
 * Toggle is_pinned on a news article (flips current value server-side).
 * @param {number} id
 * @param {string} token  — JWT token
 */
export async function toggleNewsPin(id, token) {
  const res = await client.patch(`/news/${id}/pin`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Admin login — returns { access_token, token_type, expires_in_days }.
 * @param {{ email: string, password: string }} credentials
 */
export async function adminLogin({ email, password }) {
  const res = await client.post('/admin/login', { email, password });
  return res.data;
}
