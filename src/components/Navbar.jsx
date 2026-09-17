// components/Navbar.jsx
// Sticky top navbar with brand, nav links, "More" dropdown, actions, and mobile hamburger.
// Shows Login button when no JWT exists; Admin Dashboard + Logout when logged in.

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';
import { openEnquiryModal } from '../api/enquiries';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen]               = useState(false);
  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen]   = useState(false);
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const closeMenu = () => {
    setMenuOpen(false);
    setDesktopMoreOpen(false);
    setMobileMoreOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/');
  };

  const isMoreActive = pathname.startsWith('/ebooks') || pathname.startsWith('/e-books') || pathname.startsWith('/calendar') || pathname.startsWith('/appointments') || pathname.startsWith('/book-appointment');

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation" style={{ position: 'relative' }}>
      <div className="container navbar__inner">

        {/* ── Brand ───────────────────────────────────────────────────── */}
        <Link to="/" className="navbar__brand" onClick={closeMenu} aria-label={siteConfig.schoolName}>
          <img
            src={siteConfig.logo}
            alt={`${siteConfig.schoolName} logo`}
            className="navbar__logo-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          <span className="navbar__logo-fallback" style={{ display: 'none' }}>
            {siteConfig.schoolNameShort}
          </span>
          <span className="navbar__brand-text">
            <span className="navbar__school-name">{siteConfig.schoolName}</span>
            <span className="navbar__school-tagline">{siteConfig.tagline}</span>
          </span>
        </Link>

        {/* ── Center nav links (desktop only) ─────────────────────────── */}
        <ul className="navbar__links" role="list">
          {siteConfig.navLinks.map((link) => {
            const isAnchor   = link.href.startsWith('#');
            const targetHref = isAnchor && pathname !== '/' ? `/${link.href}` : link.href;
            return (
              <li key={link.label}>
                {isAnchor ? (
                  <a href={targetHref} className="navbar__link">{link.label}</a>
                ) : (
                  <Link to={link.href} className={`navbar__link ${pathname === link.href ? 'active' : ''}`}>
                    {link.label}
                  </Link>
                )}
              </li>
            );
          })}

          {/* ── "More" Dropdown ───────────────────────────────────────── */}
          <li
            className="navbar__dropdown-wrapper"
            onMouseEnter={() => setDesktopMoreOpen(true)}
            onMouseLeave={() => setDesktopMoreOpen(false)}
          >
            <button
              type="button"
              className={`navbar__link navbar__dropdown-btn ${isMoreActive ? 'active' : ''}`}
              onClick={() => setDesktopMoreOpen((prev) => !prev)}
              aria-expanded={desktopMoreOpen}
              aria-haspopup="true"
            >
              More
              <svg
                className={`navbar__dropdown-chevron ${desktopMoreOpen ? 'open' : ''}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <div className={`navbar__dropdown-menu ${desktopMoreOpen ? 'is-open' : ''}`} role="menu">
              <Link
                to="/ebooks"
                className={`navbar__dropdown-item ${pathname.startsWith('/ebooks') || pathname.startsWith('/e-books') ? 'active' : ''}`}
                onClick={() => setDesktopMoreOpen(false)}
                role="menuitem"
              >
                <div className="navbar__dropdown-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="navbar__dropdown-title">E-books</div>
                  <div className="navbar__dropdown-desc">NCERT Digital Textbooks</div>
                </div>
              </Link>

              <Link
                to="/calendar"
                className={`navbar__dropdown-item ${pathname === '/calendar' ? 'active' : ''}`}
                onClick={() => setDesktopMoreOpen(false)}
                role="menuitem"
              >
                <div className="navbar__dropdown-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className="navbar__dropdown-title">Calendar</div>
                  <div className="navbar__dropdown-desc">Events, Vacations &amp; Exams</div>
                </div>
              </Link>

              <Link
                to="/visit-campus"
                className={`navbar__dropdown-item ${pathname === '/visit-campus' ? 'active' : ''}`}
                onClick={() => setDesktopMoreOpen(false)}
                role="menuitem"
              >
                <div className="navbar__dropdown-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="navbar__dropdown-title">Visit Campus</div>
                  <div className="navbar__dropdown-desc">Location, Map &amp; Directions</div>
                </div>
              </Link>

              <Link
                to="/appointments"
                className={`navbar__dropdown-item ${pathname === '/appointments' || pathname === '/book-appointment' ? 'active' : ''}`}
                onClick={() => setDesktopMoreOpen(false)}
                role="menuitem"
              >
                <div className="navbar__dropdown-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className="navbar__dropdown-title">Book Appointment</div>
                  <div className="navbar__dropdown-desc">Schedule Campus Tour &amp; Counseling</div>
                </div>
              </Link>
            </div>
          </li>
        </ul>

        {/* ── Right actions (desktop only) ────────────────────────────── */}
        <div className="navbar__actions">
          {siteConfig.visitUsLink.href.startsWith('/') ? (
            <Link
              to={siteConfig.visitUsLink.href}
              className={`navbar__visit-link ${pathname === siteConfig.visitUsLink.href ? 'active' : ''}`}
            >
              {siteConfig.visitUsLink.label}
            </Link>
          ) : (
            <a
              href={pathname !== '/' && siteConfig.visitUsLink.href.startsWith('#') ? `/${siteConfig.visitUsLink.href}` : siteConfig.visitUsLink.href}
              className="navbar__visit-link"
            >
              {siteConfig.visitUsLink.label}
            </a>
          )}
          <Button variant="primary" as="button" onClick={(e) => { e.preventDefault(); openEnquiryModal(); }}>
            {siteConfig.enquireLink.label}
          </Button>

          {/* ── Auth buttons: conditional on JWT ── */}
          {isAuthenticated ? (
            <>
              <Link to="/admin/dashboard" className="navbar__admin-login-btn" aria-label="Admin dashboard">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Dashboard
              </Link>
              <button className="navbar__admin-login-btn navbar__admin-logout-btn" onClick={handleLogout} aria-label="Log out">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="navbar__admin-login-btn" aria-label="Admin login">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Login
            </Link>
          )}
        </div>

        {/* ── Hamburger toggle (mobile only) ──────────────────────────── */}
        <button
          className={`navbar__hamburger${menuOpen ? ' is-open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        className={`navbar__mobile-menu${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <ul className="navbar__mobile-links" role="list">
          {siteConfig.navLinks.map((link) => {
            const isAnchor   = link.href.startsWith('#');
            const targetHref = isAnchor && pathname !== '/' ? `/${link.href}` : link.href;
            return (
              <li key={link.label}>
                {isAnchor ? (
                  <a href={targetHref} onClick={closeMenu}>{link.label}</a>
                ) : (
                  <Link to={link.href} onClick={closeMenu} className={pathname === link.href ? 'active' : ''}>
                    {link.label}
                  </Link>
                )}
              </li>
            );
          })}

          {/* Mobile "More" Accordion */}
          <li className="navbar__mobile-more-wrapper">
            <button
              type="button"
              className={`navbar__mobile-more-toggle ${isMoreActive ? 'active' : ''}`}
              onClick={() => setMobileMoreOpen((prev) => !prev)}
              aria-expanded={mobileMoreOpen}
            >
              <span>More Resources</span>
              <svg
                className={`navbar__dropdown-chevron ${mobileMoreOpen ? 'open' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <div className={`navbar__mobile-more-panel ${mobileMoreOpen ? 'is-open' : ''}`}>
              <Link
                to="/ebooks"
                className={`navbar__mobile-sublink ${pathname.startsWith('/ebooks') || pathname.startsWith('/e-books') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="navbar__mobile-sublink-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </span>
                <div>
                  <div className="navbar__mobile-sublink-title">E-books</div>
                  <div className="navbar__mobile-sublink-desc">NCERT Digital Textbooks</div>
                </div>
              </Link>

              <Link
                to="/calendar"
                className={`navbar__mobile-sublink ${pathname === '/calendar' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="navbar__mobile-sublink-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <div>
                  <div className="navbar__mobile-sublink-title">Calendar</div>
                  <div className="navbar__mobile-sublink-desc">Events, Vacations &amp; Exams</div>
                </div>
              </Link>

              <Link
                to="/visit-campus"
                className={`navbar__mobile-sublink ${pathname === '/visit-campus' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="navbar__mobile-sublink-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div>
                  <div className="navbar__mobile-sublink-title">Visit Campus</div>
                  <div className="navbar__mobile-sublink-desc">Location, Map &amp; Directions</div>
                </div>
              </Link>

              <Link
                to="/appointments"
                className={`navbar__mobile-sublink ${pathname === '/appointments' || pathname === '/book-appointment' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="navbar__mobile-sublink-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <div>
                  <div className="navbar__mobile-sublink-title">Book Appointment</div>
                  <div className="navbar__mobile-sublink-desc">Schedule Campus Tour &amp; Counseling</div>
                </div>
              </Link>
            </div>
          </li>
        </ul>

        <div className="navbar__mobile-actions">
          {siteConfig.visitUsLink.href.startsWith('/') ? (
            <Link
              to={siteConfig.visitUsLink.href}
              className="navbar__mobile-visit-btn"
              onClick={closeMenu}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '6px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {siteConfig.visitUsLink.label} &rarr;
            </Link>
          ) : (
            <a
              href={pathname !== '/' && siteConfig.visitUsLink.href.startsWith('#') ? `/${siteConfig.visitUsLink.href}` : siteConfig.visitUsLink.href}
              className="navbar__mobile-visit-btn"
              onClick={closeMenu}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '6px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {siteConfig.visitUsLink.label} &rarr;
            </a>
          )}
          <button type="button" className="navbar__mobile-enquire-btn"
            onClick={(e) => { e.preventDefault(); closeMenu(); openEnquiryModal(); }}>
            {siteConfig.enquireLink.label}
          </button>

          {/* Auth: mobile drawer */}
          {isAuthenticated ? (
            <>
              <Link to="/admin/dashboard" className="navbar__mobile-admin-login-btn" onClick={closeMenu}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Admin Dashboard
              </Link>
              <button className="navbar__mobile-admin-login-btn navbar__mobile-logout-btn" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="navbar__mobile-admin-login-btn" onClick={closeMenu}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
