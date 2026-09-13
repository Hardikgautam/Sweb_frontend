// src/utils/publicUrl.js
// ─────────────────────────────────────────────────────────────────────────────
// Returns an absolute URL for a public/ asset, correctly prefixed with Vite's
// BASE_URL so paths work both at the domain root AND under a sub-path like
// /Sweb_frontend/ (GitHub Pages deployment).
//
// Usage:
//   import { publicUrl } from '../utils/publicUrl';
//   <img src={publicUrl('images/logo.png')} />
//
// Pass the path WITHOUT a leading slash — just the relative segment:
//   publicUrl('images/logo.png')   → '/Sweb_frontend/images/logo.png'  (prod)
//                                  → '/images/logo.png'                (dev root)
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL; // e.g. '/' in dev, '/Sweb_frontend/' in prod

/**
 * @param {string} path - Path relative to /public, WITHOUT a leading slash.
 *   Examples: 'images/logo.png', 'videos/languages.mp4'
 * @returns {string} Full URL-safe path prefixed with the Vite base URL.
 */
export function publicUrl(path) {
  // Strip any accidental leading slash so we never double-slash
  const clean = path.replace(/^\/+/, '');
  // BASE always ends with '/' (Vite guarantees this)
  return `${BASE}${clean}`;
}
