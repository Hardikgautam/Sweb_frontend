// pages/AdminLogin.jsx
// Admin login page — reachable at /admin/login.
// Authenticates against POST /api/admin/login (FastAPI backend).
// On success, stores the JWT via AuthContext (localStorage) and redirects
// to /admin/dashboard (or wherever the user was originally going).

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminLogin } from '../api/news';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  // If already logged in, bounce straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin({ email: email.trim(), password });
      // Persist JWT via context (stored in localStorage)
      login(data.access_token, email.trim());
      setSuccess(true);

      // Redirect to where they came from, or dashboard
      const from = location.state?.from?.pathname || '/admin/dashboard';
      setTimeout(() => navigate(from, { replace: true }), 900);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(
        msg.toLowerCase().includes('invalid')
          ? 'Incorrect email or password. Please try again.'
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page" role="main">
      <div className="admin-login__card">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="admin-login__header">
          <div className="admin-login__lock-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="admin-login__title">Admin Portal</h1>
          <p className="admin-login__subtitle">Sign in with your admin credentials</p>
        </div>

        {/* ── Success flash ───────────────────────────────────── */}
        {success ? (
          <div className="admin-login__success" role="status" aria-live="polite">
            <div className="admin-login__success-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="admin-login__success-title">Authenticated!</p>
            <p className="admin-login__success-sub">Redirecting to dashboard…</p>
          </div>
        ) : (
          /* ── Login form ─────────────────────────────────────── */
          <form className="admin-login__form" onSubmit={handleSubmit} noValidate aria-label="Admin login form">
            {/* Email */}
            <div className="admin-login__field">
              <label htmlFor="admin-email" className="admin-login__label">Email</label>
              <div className="admin-login__input-wrap">
                <svg className="admin-login__input-icon" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input id="admin-email" type="email" className="admin-login__input"
                  placeholder="admin@school.edu" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" required aria-required="true"
                  aria-describedby={error ? 'admin-login-error' : undefined} />
              </div>
            </div>

            {/* Password */}
            <div className="admin-login__field">
              <label htmlFor="admin-password" className="admin-login__label">Password</label>
              <div className="admin-login__input-wrap">
                <svg className="admin-login__input-icon" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input id="admin-password" type={showPassword ? 'text' : 'password'}
                  className="admin-login__input" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" required aria-required="true"
                  aria-describedby={error ? 'admin-login-error' : undefined} />
                <button type="button" className="admin-login__pw-toggle"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div id="admin-login-error" className="admin-login__error" role="alert" aria-live="assertive">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="admin-login__error-text">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button id="admin-login-submit" type="submit" className="admin-login__submit"
              disabled={loading} aria-busy={loading}>
              {loading ? (
                <><span className="admin-login__spinner" aria-hidden="true" /> Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── Back link ───────────────────────────────────────── */}
        {!success && (
          <div className="admin-login__back">
            <Link to="/" aria-label="Return to the school homepage">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to school website
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
