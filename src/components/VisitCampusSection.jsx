// src/components/VisitCampusSection.jsx
// Interactive Google Map and Campus Visit Information
import { useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import { openEnquiryModal } from '../api/enquiries';
import { openAppointmentModal } from '../api/appointments';
import Button from './Button';
import './VisitCampusSection.css';

export default function VisitCampusSection({ isHomeSection = false }) {
  const [copied, setCopied] = useState(false);

  const loc = siteConfig.location || {};
  const lat = loc.coordinates?.lat ?? 29.3909;
  const lng = loc.coordinates?.lng ?? 76.9635;
  const zoom = loc.mapZoom ?? 15;
  const address = loc.address || siteConfig.address;
  const landmark = loc.landmark;
  const visitingHours = loc.visitingHours || [];
  const schoolName = siteConfig.schoolName || 'XYZ Public School';

  // Google Maps Embed URL (Standard Embed, no API key required)
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  // Native Navigation / Turn-by-Turn Directions URL
  // Opens native Google Maps app on iOS/Android or Google Maps web with automatic geolocation origin
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Direct Pin Location URL for web viewing
  const fullMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback if clipboard API is restricted
      setCopied(false);
    }
  };

  return (
    <section
      id="contact"
      className={`visit-section ${isHomeSection ? 'visit-section--home' : ''}`}
      aria-labelledby="visit-section-heading"
    >
      <div className="container">
        {/* ── Section Header ────────────────────────────────────────── */}
        <div className="visit-section__header">
          <div className="visit-section__kicker">
            <span className="visit-section__kicker-line" aria-hidden="true" />
            <span className="visit-section__kicker-text">Location &amp; Campus Tours</span>
          </div>
          <h2 id="visit-section-heading" className="visit-section__headline">
            Visit Our Campus
          </h2>
          <p className="visit-section__subhead">
            Experience our vibrant learning spaces, modern labs, and serene campus firsthand.
            We look forward to welcoming you and your family.
          </p>
        </div>

        {/* ── Main 2-Column Grid: Info & Map ────────────────────────── */}
        <div className="visit-grid">
          {/* ── Left Column: Contact Details, Hours & Directions CTA ── */}
          <div className="visit-info">
            {/* Address Card */}
            <div className="visit-card visit-card--address">
              <div className="visit-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="visit-card__content">
                <h3 className="visit-card__title">Campus Address</h3>
                <address className="visit-address">
                  <strong>{schoolName}</strong>
                  <span>{address}</span>
                  {landmark && (
                    <span className="visit-address__landmark">
                      <strong>Landmark:</strong> {landmark}
                    </span>
                  )}
                </address>

                <div className="visit-address__actions">
                  <button
                    type="button"
                    className="visit-copy-btn"
                    onClick={handleCopyAddress}
                    aria-label="Copy campus address to clipboard"
                  >
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        Address Copied!
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                        Copy Address
                      </>
                    )}
                  </button>

                  <a
                    href={fullMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="visit-external-link"
                  >
                    View on Maps &rarr;
                  </a>
                </div>
              </div>
            </div>

            {/* Primary Directions CTA Button */}
            <div className="visit-cta-wrap">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-directions-btn"
                aria-label="Get directions to the school in Google Maps"
              >
                <svg className="visit-directions-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span>Get Directions (Turn-by-Turn)</span>
              </a>
              <span className="visit-cta-hint">
                Opens native Google Maps on mobile devices or turn-by-turn navigation in browser
              </span>
            </div>

            {/* Visiting Hours Card */}
            <div className="visit-card visit-card--hours">
              <div className="visit-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="visit-card__content">
                <h3 className="visit-card__title">Visiting &amp; Reception Hours</h3>
                <ul className="visit-hours-list">
                  {visitingHours.map((vh, idx) => (
                    <li key={idx} className="visit-hours-item">
                      <span className="visit-hours-days">{vh.days}</span>
                      <span className="visit-hours-time">{vh.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Schedule a Tour Card */}
            <div className="visit-card visit-card--tour">
              <div className="visit-card__icon visit-card__icon--gold" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="visit-card__content">
                <h3 className="visit-card__title">Schedule an In-Person Tour</h3>
                <p className="visit-tour-desc">
                  {loc.tourNotice || 'Campus walk-throughs require prior appointment with our admissions counselors.'}
                </p>
                <div className="visit-tour-action">
                  <Button
                    variant="primary"
                    as="button"
                    onClick={(e) => {
                      e.preventDefault();
                      openAppointmentModal('campus_tour');
                    }}
                  >
                    Book a Campus Tour
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Interactive Embedded Google Map ───────── */}
          <div className="visit-map-column">
            <div className="visit-map-frame-wrapper">
              <div className="visit-map-topbar">
                <div className="visit-map-topbar__pin">
                  <span className="visit-map-topbar__dot" aria-hidden="true" />
                  <span className="visit-map-topbar__label">Pinned Location: {schoolName}</span>
                </div>
                <div className="visit-map-topbar__coords" title="GPS Coordinates">
                  {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                </div>
              </div>

              {/* The responsive Google Map Embed iframe */}
              <div className="visit-map-embed-container">
                <iframe
                  title={`Google Map showing ${schoolName} campus location`}
                  src={embedUrl}
                  className="visit-map-iframe"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Footer strip below map */}
              <div className="visit-map-footbar">
                <div className="visit-map-footbar__info">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>Interactive map: pinch to zoom, drag to pan</span>
                </div>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-map-footbar__action"
                >
                  Navigate &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
