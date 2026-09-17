// components/Hero.jsx
// Homepage hero — two-column layout on desktop, stacked on mobile.
// All copy is imported from heroContent.js — edit that file, not here.

import { heroContent } from '../config/heroContent';
import { openEnquiryModal } from '../api/enquiries';
import { openAppointmentModal } from '../api/appointments';
import Button from './Button';
import './Hero.css';

export default function Hero() {
  const {
    kicker,
    headlineLines,
    body,
    ctaPrimary,
    ctaSecondary,
    statsLine,
    image,
    imageAlt,
    badge,
  } = heroContent;

  return (
    <section className="hero" aria-label="Hero">
      <div className="container hero__grid">

        {/* ── Left column: text ──────────────────────────────────────── */}
        <div className="hero__text">

          {/* Kicker line */}
          <div className="hero__kicker">
            <span className="hero__kicker-line" aria-hidden="true" />
            <span className="hero__kicker-text">{kicker}</span>
          </div>

          {/* Main serif headline — render each line separately */}
          <h1 className="hero__headline">
            {headlineLines.map((line, i) => (
              <span key={i} style={{ display: 'block' }}>{line}</span>
            ))}
          </h1>

          {/* Body paragraph */}
          <p className="hero__body">{body}</p>

          {/* CTA buttons */}
          <div className="hero__buttons">
            <Button
              variant="primary"
              as="button"
              onClick={(e) => {
                e.preventDefault();
                openEnquiryModal();
              }}
              id="hero-cta-primary"
            >
              {ctaPrimary.label}
            </Button>
            <Button
              variant="secondary-maroon"
              as="button"
              onClick={(e) => {
                e.preventDefault();
                openAppointmentModal('campus_tour');
              }}
              id="hero-cta-secondary"
            >
              {ctaSecondary.label}
            </Button>
          </div>

          {/* Stats line */}
          <div className="hero__stats">
            <span className="hero__stats-line">{statsLine}</span>
          </div>
        </div>

        {/* ── Right column: image + frame + badge ───────────────────── */}
        <div className="hero__image-col">
          {/* Gold offset frame — positioned behind the image */}
          <div className="hero__image-frame" aria-hidden="true" />

          {/* Photo */}
          <div className="hero__image-wrapper">
            <img
              src={image}
              alt={imageAlt}
              className="hero__image"
              loading="eager"
            />

            {/* Circular badge overlapping bottom-left of image */}
            <div className="hero__badge" aria-label={badge.lines.join(' ')}>
              {badge.icon && <span className="hero__badge-icon" aria-hidden="true">{badge.icon}</span>}
              {badge.lines.map((line, idx) => (
                <span key={idx} className="hero__badge-line">{line}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
