// components/WhyUsSection.jsx
// Section 02: "Why Our School" / "Why Us"
// All text and stats are imported from whyUsContent.js — edit that file, not here.

import { whyUsContent } from '../config/whyUsContent';
import './WhyUsSection.css';

export default function WhyUsSection() {
  const {
    image,
    imageAlt,
    statCard,
    kickerNumber,
    kickerLabel,
    headlineLines,
    body,
    checklist,
    philosophyLink,
  } = whyUsContent;

  return (
    <section id="why-us" className="why-us-section" aria-label="Why Our School">
      <div id="about" style={{ position: 'relative', top: '-80px', visibility: 'hidden' }} />
      <div className="container why-us-section__grid">

        {/* ── Left Column: Image with maroon bars + navy stat card ───── */}
        <div className="why-us-section__image-col">
          <div className="why-us-section__image-wrapper">
            <img
              src={image}
              alt={imageAlt}
              className="why-us-section__image"
              loading="lazy"
            />
          </div>

          {/* Floating dark navy stat card overlapping bottom-right */}
          <div className="why-us-section__stat-card">
            <span className="why-us-section__stat-number">{statCard.number}</span>
            <span className="why-us-section__stat-label">{statCard.label}</span>
          </div>
        </div>

        {/* ── Right Column: Copy + Checklist + Link ──────────────────── */}
        <div className="why-us-section__content-col">

          {/* Kicker */}
          <div className="why-us-section__kicker">
            <span className="why-us-section__kicker-line" aria-hidden="true" />
            <span className="why-us-section__kicker-text">
              {kickerNumber} &nbsp;{kickerLabel}
            </span>
          </div>

          {/* Headline */}
          <h2 className="why-us-section__headline">
            {headlineLines.map((line, idx) => (
              <span key={idx}>{line}</span>
            ))}
          </h2>

          {/* Body */}
          <p className="why-us-section__body">{body}</p>

          {/* Checklist */}
          <ul className="why-us-section__checklist" role="list">
            {checklist.map((item, idx) => (
              <li key={idx} className="why-us-section__check-item">
                <span className="why-us-section__check-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Philosophy link */}
          <div>
            <a href={philosophyLink.href} className="why-us-section__link">
              {philosophyLink.label}
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
