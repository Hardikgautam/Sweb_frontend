// components/AcademicsSection.jsx
// Section 01: Academics with 6 subject group cards powered by live API data.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { academicsContent } from '../config/academicsContent';
import { getSubjects } from '../api/subjects';
import { useSwipeCarousel } from '../hooks/useSwipeCarousel';
import CarouselControls from './CarouselControls';
import './AcademicsSection.css';

// ─────────────────────────────────────────────────────────────────────────────
// Build a lookup map: id → route from the static config (always authoritative).
// This ensures API responses can never accidentally overwrite routes with
// '#contact' or any placeholder value.
// ─────────────────────────────────────────────────────────────────────────────
const ROUTE_BY_ID = Object.fromEntries(
  academicsContent.subjects.map((s) => [s.id, s.link])
);

// Clean inline SVG icons for each subject group
function SubjectIcon({ name }) {
  switch (name) {
    case 'languages':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="13" y2="11" />
        </svg>
      );
    case 'mathematics':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
          <circle cx="12" cy="7" r="1.2" fill="currentColor" />
          <circle cx="12" cy="17" r="1.2" fill="currentColor" />
          <circle cx="7" cy="12" r="1.2" fill="currentColor" />
          <circle cx="17" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'science':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 2v7.5L5 18a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-8.5V2" />
          <line x1="8.5" y1="2" x2="15.5" y2="2" />
          <line x1="7" y1="15" x2="17" y2="15" />
        </svg>
      );
    case 'social':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'computer':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <polyline points="7 8 10 11 7 14" />
          <line x1="12" y1="14" x2="16" y2="14" />
        </svg>
      );
    case 'arts':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z" />
          <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" />
          <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" />
          <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
          <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export default function AcademicsSection() {
  const { kickerNumber, kickerLabel, headlineLines, description, subjects: fallbackSubjects } = academicsContent;
  const [subjects, setSubjects] = useState(fallbackSubjects);
  const {
    trackRef,
    activeIndex,
    handleScroll,
    scrollToIndex,
    scrollPrev,
    scrollNext,
  } = useSwipeCarousel(subjects.length);

  useEffect(() => {
    getSubjects()
      .then((data) => {
        if (data && data.length > 0) {
          // Normalize backend fields to card format.
          // FIX: always resolve the route from ROUTE_BY_ID (static config) — the API
          // has no knowledge of frontend routes, so we must never use a field from it.
          const formatted = data.map((item) => ({
            id:     item.id,
            icon:   item.icon_key || 'languages',
            title:  item.title,
            desc:   item.description,
            levels: item.levels_text,
            link:   ROUTE_BY_ID[item.id]
                      ?? fallbackSubjects.find((s) => s.id === item.id)?.link
                      ?? `/subjects/${item.id}`,
          }));
          setSubjects(formatted);
        }
      })
      .catch((err) => {
        console.warn('Could not load subjects from API, using fallback:', err);
      });
  }, []);

  return (
    <section id="academics" className="academics-section" aria-label="Academics">
      <div className="container">

        {/* ── Section Header Row ───────────────────────────────────────── */}
        <div className="academics-section__header">
          <div className="academics-section__header-left">
            <div className="academics-section__kicker">
              <span className="academics-section__kicker-line" aria-hidden="true" />
              <span className="academics-section__kicker-text">
                {kickerNumber}&nbsp;{kickerLabel}
              </span>
            </div>
            <h2 className="academics-section__headline">
              {headlineLines.map((line, idx) => (
                <span key={idx}>{line}</span>
              ))}
            </h2>
          </div>

          <p className="academics-section__description">
            {description}
          </p>
        </div>

        {/* ── 6-Card Subject Grid (Grid on Desktop, Swipe Carousel on Mobile) ── */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="academics-section__grid"
          tabIndex={0}
          role="region"
          aria-label="Curriculum subjects carousel"
        >
          {subjects.map((subj) => (
            // FIX: wrap the ENTIRE card in a <Link> so every pixel of the card is
            // clickable. "Explore →" is a <span> (not a nested <Link>/<a>) so HTML
            // validity and click bubbling are both correct.
            <Link
              key={subj.id}
              to={subj.link}
              className="subject-card"
              aria-label={`Explore ${subj.title}`}
            >
              <div className="subject-card__icon-box">
                <SubjectIcon name={subj.icon} />
              </div>
              <h3 className="subject-card__title">{subj.title}</h3>
              <p className="subject-card__desc">{subj.desc}</p>
              <div className="subject-card__divider" aria-hidden="true" />
              <div className="subject-card__footer">
                <span className="subject-card__levels">{subj.levels}</span>
                <span className="subject-card__link" aria-hidden="true">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Mobile/Tablet Carousel Controls (Dots & Arrows) ────────── */}
        <CarouselControls
          total={subjects.length}
          activeIndex={activeIndex}
          onPrev={scrollPrev}
          onNext={scrollNext}
          onSelect={scrollToIndex}
          ariaLabel="Curriculum subjects carousel navigation"
        />

      </div>
    </section>
  );
}

