// components/SchoolLifeSection.jsx
// Section 04: "School Life" with a 3x2 responsive photo grid.
// All copy and image paths are imported from schoolLifeContent.js — edit that file, not here.

import { schoolLifeContent } from '../config/schoolLifeContent';
import './SchoolLifeSection.css';

export default function SchoolLifeSection() {
  const { kickerNumber, kickerLabel, headlineLines, description, images } = schoolLifeContent;

  return (
    <section id="life" className="school-life-section" aria-label="School Life">
      <div className="container">

        {/* ── Section Header Row ───────────────────────────────────────── */}
        <div className="school-life-section__header">
          <div className="school-life-section__header-left">
            <div className="school-life-section__kicker">
              <span className="school-life-section__kicker-line" aria-hidden="true" />
              <span className="school-life-section__kicker-text">
                {kickerNumber} &nbsp;{kickerLabel}
              </span>
            </div>
            <h2 className="school-life-section__headline">
              {headlineLines.map((line, idx) => (
                <span key={idx}>{line}</span>
              ))}
            </h2>
          </div>

          <p className="school-life-section__description">
            {description}
          </p>
        </div>

        {/* ── Photo Grid: 3 cols × 2 rows on desktop ───────────────────── */}
        <div className="school-life-section__grid">
          {images.map((photo, idx) => (
            <div key={idx} className="school-life-section__photo-card">
              <img
                src={photo.src}
                alt={photo.alt}
                className="school-life-section__photo"
                loading="lazy"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
