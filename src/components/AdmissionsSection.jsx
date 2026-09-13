// components/AdmissionsSection.jsx
// Section 05: Admissions process with 4 steps and highlighted enquiry strip.
// All copy is imported from admissionsContent.js — edit that file, not here.

import { Link } from 'react-router-dom';
import { admissionsContent } from '../config/admissionsContent';
import { openEnquiryModal } from '../api/enquiries';
import { useSwipeCarousel } from '../hooks/useSwipeCarousel';
import CarouselControls from './CarouselControls';
import Button from './Button';
import './AdmissionsSection.css';

export default function AdmissionsSection() {
  const { kickerNumber, kickerLabel, headlineLines, description, steps, callout } = admissionsContent;
  const {
    trackRef,
    activeIndex,
    handleScroll,
    scrollToIndex,
    scrollPrev,
    scrollNext,
  } = useSwipeCarousel(steps.length);

  return (
    <section id="admissions" className="admissions-section" aria-label="Admissions">
      <div className="container">

        {/* ── Header Row ─────────────────────────────────────────────── */}
        <div className="admissions-section__header">
          <div className="admissions-section__header-left">
            <div className="admissions-section__kicker">
              <span className="admissions-section__kicker-line" aria-hidden="true" />
              <span className="admissions-section__kicker-text">
                {kickerNumber} &nbsp;{kickerLabel}
              </span>
            </div>
            <h2 className="admissions-section__headline">
              {headlineLines.map((line, idx) => (
                <span key={idx}>{line}</span>
              ))}
            </h2>
          </div>

          <p className="admissions-section__description">
            {description}
          </p>
        </div>

        {/* ── 4 Numbered Steps Row (Grid on Desktop, Swipe Carousel on Mobile) ── */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="admissions-section__steps-grid"
          tabIndex={0}
          role="region"
          aria-label="Admission steps carousel"
        >
          {steps.map((step) => (
            <div key={step.stepNumber} className="admission-step-card">
              <span className="admission-step-card__number">{step.stepNumber}</span>
              <h3 className="admission-step-card__title">{step.title}</h3>
              <p className="admission-step-card__desc">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Mobile/Tablet Carousel Controls (Dots & Arrows) ────────── */}
        <CarouselControls
          total={steps.length}
          activeIndex={activeIndex}
          onPrev={scrollPrev}
          onNext={scrollNext}
          onSelect={scrollToIndex}
          ariaLabel="Admissions steps carousel navigation"
        />

        {/* ── Highlighted Callout Banner Strip ───────────────────────── */}
        <div className="admissions-section__callout">
          <div className="admissions-section__callout-content">
            <div className="admissions-section__callout-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="admissions-section__callout-text">{callout.badgeText}</p>
          </div>

          <div className="admissions-section__callout-action">
            <Link to="/fees-scholarships" className="admissions-section__fees-link">
              Fees &amp; Scholarships &rarr;
            </Link>
            <Button
              variant="primary"
              as="button"
              onClick={(e) => {
                e.preventDefault();
                openEnquiryModal();
              }}
            >
              {callout.buttonLabel}
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
