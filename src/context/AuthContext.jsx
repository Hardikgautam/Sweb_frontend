// src/context/AuthContext.jsx
// Provides admin JWT state to every component in the tree.
// JWT is stored in localStorage so it survives page refreshes.
// Use the useAuth() hook to read/write auth state.

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const TOKEN_KEY = 'admin_token';
const EMAIL_KEY = 'admin_email';

const AuthContext = createContext(null);

/** Read stored token — returns null if missing or clearly malformed */
function readStoredToken() {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return null;
    // Basic JWT shape check (3 base64 parts separated by '.')
    if (t.split('.').length !== 3) { localStorage.removeItem(TOKEN_KEY); return null; }
    // Decode payload and check expiry
    const payload = JSON.parse(atob(t.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EMAIL_KEY);
      return null;
    }
    return t;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken());
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || '');

  const login = useCallback((jwt, email = '') => {
    localStorage.setItem(TOKEN_KEY, jwt);
    if (email) localStorage.setItem(EMAIL_KEY, email);
    setToken(jwt);
    setAdminEmail(email);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    // Also clear legacy sessionStorage keys from earlier implementation
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_email');
    setToken(null);
    setAdminEmail('');
  }, []);

  /** True when a non-expired JWT exists */
  const isAuthenticated = Boolean(token);

  const value = useMemo(
    () => ({ token, adminEmail, isAuthenticated, login, logout }),
    [token, adminEmail, isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access auth state and helpers anywhere in the component tree */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
