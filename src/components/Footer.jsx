// components/Footer.jsx
// Responsive dark navy footer with collapsible accordion sections on mobile/tablet
// and standard multi-column layout on desktop.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';
import { subscribeNewsletter } from '../api/newsletter';
import './Footer.css';

// Small inline SVGs for outline social buttons
function SocialIcon({ platform }) {
  switch (platform) {
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 4l11.733 16h4.267l-11.733-16z" />
          <path d="M4 20l6.768-6.768m2.464-2.464l6.768-6.768" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Footer() {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Accordion open/close state for mobile/tablet
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      await subscribeNewsletter(emailInput.trim());
      setSubscribed(true);
      setEmailInput('');
    } catch (err) {
      console.error('Newsletter error:', err);
      if (err.response?.status === 422) {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          setErrorMessage(detail);
        } else if (Array.isArray(detail) && detail[0]?.msg) {
          setErrorMessage(detail[0].msg.replace(/^Value error,\s*/i, ''));
        } else {
          setErrorMessage('Please enter a valid email address.');
        }
      } else if (err.response?.status === 400 && err.response?.data?.detail?.includes('already registered')) {
        setErrorMessage('This email is already subscribed to our newsletter.');
      } else {
        setErrorMessage('Unable to subscribe right now. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">

        {/* ── Main Grid ────────────────────────────────────────────────── */}
        <div className="footer__grid">

          {/* Column 1: Always visible Brand, Address & Socials */}
          <div className="footer__brand-col">
            <div className="footer__brand-header">
              <img
                src={siteConfig.logoWhite || siteConfig.logo}
                alt={`${siteConfig.schoolName} crest`}
                className="footer__logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <span className="footer__logo-fallback" style={{ display: 'none' }}>
                {siteConfig.schoolNameShort}
              </span>

              <h2 className="footer__school-name">{siteConfig.schoolName}</h2>
            </div>

            {siteConfig.motto && (
              <p className="footer__motto">{siteConfig.motto}</p>
            )}

            <div className="footer__address-block">
              <p>{siteConfig.address}</p>
              <div className="footer__contact-line">
                <a href={`tel:${siteConfig.phone.replace(/\s/g, '')}`} className="footer__contact-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '6px' }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {siteConfig.phone}
                </a>
                <a href={`mailto:${siteConfig.email}`} className="footer__contact-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '6px' }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {siteConfig.email}
                </a>
              </div>
            </div>

            {/* Outline social icons */}
            <div className="footer__social-row" aria-label="Social Media Links">
              {siteConfig.social.map((item) => (
                <a
                  key={item.platform}
                  href={item.href}
                  className="footer__social-icon-btn"
                  aria-label={item.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon platform={item.platform} />
                </a>
              ))}
            </div>
          </div>

          {/* Accordion / Link Columns (Admissions, Academics, School Life, Updates) */}
          <div className="footer__accordion-group">
            {siteConfig.footerColumns.map((col, index) => {
              const sectionId = `footer-sec-${index}-${col.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              const panelId   = `footer-panel-${index}`;
              const isOpen    = Boolean(openSections[sectionId]);

              return (
                <div
                  key={col.title}
                  className={`footer__accordion-item ${col.isNewsletter ? 'footer__newsletter-col' : 'footer__links-col'}`}
                >
                  {/* Accordion header button on mobile / heading on desktop */}
                  <button
                    type="button"
                    className="footer__accordion-trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    id={sectionId}
                    onClick={() => toggleSection(sectionId)}
                  >
                    <span className="footer__col-title">{col.title}</span>
                    <span className="footer__accordion-chevron" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>

                  {/* Smooth collapsible content wrapper */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={sectionId}
                    className={`footer__accordion-wrapper ${isOpen ? 'is-open' : ''}`}
                  >
                    <div className="footer__accordion-content">
                      {col.isNewsletter ? (
                        <>
                          <p className="footer__newsletter-text">{col.text}</p>
                          {subscribed ? (
                            <p className="footer__newsletter-success">
                              Thank you for subscribing to updates!
                            </p>
                          ) : (
                            <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
                              <input
                                type="email"
                                required
                                placeholder={col.placeholder}
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                className="footer__newsletter-input"
                                aria-label="Parent email address"
                                disabled={loading}
                              />
                              <button type="submit" className="footer__newsletter-btn" disabled={loading}>
                                {loading ? 'Subscribing…' : col.buttonText}
                              </button>
                            </form>
                          )}
                          {errorMessage && (
                            <p className="footer__newsletter-error">
                              {errorMessage}
                            </p>
                          )}
                        </>
                      ) : (
                        <ul className="footer__links-list" role="list">
                          {col.links.map((link) => {
                            const isAnchor = link.href.startsWith('#');
                            const targetTo = isAnchor ? `/${link.href}` : link.href;
                            return (
                              <li key={link.label} className="footer__link-item">
                                <Link to={targetTo} className="footer__nav-link">
                                  {link.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ── Always Visible Bottom Bar ───────────────────────────────── */}
        <div className="footer__bottom-bar">
          <div className="footer__bottom-left">
            <span>© 2026 {siteConfig.schoolName}. All rights reserved.</span>
            <span className="footer__creator-credit">
              Made by{' '}
              <a
                href="https://www.bitbytelogic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__creator-link"
              >
                bitbytelogic
              </a>
            </span>
          </div>

          <ul className="footer__legal-links" role="list" aria-label="Legal & Important links">
            {siteConfig.legalLinks.map((item) => (
              <li key={item.label}>
                <Link to={item.href} className="footer__legal-link">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/#contact" className="footer__legal-link">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
