// components/FinalCtaBanner.jsx
// Final CTA banner before the footer with maroon background and watermark seal.
// All copy is imported from finalCtaContent.js — edit that file, not here.

import { finalCtaContent } from '../config/finalCtaContent';
import { openEnquiryModal } from '../api/enquiries';
import Button from './Button';
import './FinalCtaBanner.css';

export default function FinalCtaBanner() {
  const { kicker, headlineLines, paragraph, primaryButton, secondaryButton } = finalCtaContent;

  return (
    <section className="final-cta-banner" aria-label="Admissions Call to Action">
      {/* Large faint watermark crest on the right */}
      <div className="final-cta-banner__watermark" aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Concentric rings */}
          <circle cx="100" cy="100" r="95" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="88" strokeDasharray="4 3" strokeWidth="1" />
          <circle cx="100" cy="100" r="80" strokeWidth="1" />
          {/* Inner crest / torch / book emblem */}
          <path d="M70 145c15-8 30-8 30-8s15 0 30 8v-50c-15-8-30-8-30-8s-15 0-30 8v50z" strokeWidth="2" />
          <line x1="100" y1="87" x2="100" y2="137" strokeWidth="1.5" />
          <path d="M100 48c0 0-14 12-8 26 4 10 8 13 8 13s4-3 8-13c6-14-8-26-8-26z" strokeWidth="1.8" />
          {/* Star accents */}
          <polygon points="100,20 102,26 108,26 103,30 105,36 100,32 95,36 97,30 92,26 98,26" fill="currentColor" />
        </svg>
      </div>

      <div className="container final-cta-banner__inner">
        {/* Kicker */}
        <div className="final-cta-banner__kicker">
          <span className="final-cta-banner__kicker-line" aria-hidden="true" />
          <span className="final-cta-banner__kicker-text">{kicker}</span>
        </div>

        {/* Large serif headline in off-white */}
        <h2 className="final-cta-banner__headline">
          {headlineLines.map((line, idx) => (
            <span key={idx}>{line}</span>
          ))}
        </h2>

        {/* Explanatory paragraph */}
        <p className="final-cta-banner__paragraph">{paragraph}</p>

        {/* Action buttons */}
        <div className="final-cta-banner__actions">
          <Button
            variant="cta-gold"
            as="button"
            onClick={(e) => {
              e.preventDefault();
              openEnquiryModal();
            }}
            className="btn--cta-gold"
          >
            {primaryButton.label}
          </Button>
          <Button
            variant="cta-outlined-light"
            as="button"
            onClick={(e) => {
              e.preventDefault();
              openEnquiryModal();
            }}
            className="btn--cta-outlined-light"
          >
            {secondaryButton.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
