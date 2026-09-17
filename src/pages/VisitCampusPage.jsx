// src/pages/VisitCampusPage.jsx
// Dedicated "Visit Campus" public page
import { Link } from 'react-router-dom';
import VisitCampusSection from '../components/VisitCampusSection';
import { openEnquiryModal } from '../api/enquiries';
import './VisitCampusPage.css';

export default function VisitCampusPage() {
  return (
    <div className="visit-page">
      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <section className="visit-page-hero">
        <div className="container">
          <nav className="visit-page-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="visit-page-breadcrumb__sep">/</span>
            <span className="visit-page-breadcrumb__current">Visit Campus</span>
          </nav>

          <div className="visit-page-hero__content">
            <div className="visit-page-hero__kicker">
              <span className="visit-page-hero__kicker-line" aria-hidden="true" />
              <span>Campus Tours &amp; Directions</span>
            </div>
            <h1 className="visit-page-hero__title">
              Come Experience Greenwood in Person
            </h1>
            <p className="visit-page-hero__subtitle">
              We invite prospective students and parents to walk our halls, observe active classrooms,
              explore our dedicated sports complex and STEM laboratories, and meet our faculty leaders.
            </p>
          </div>
        </div>
      </section>

      {/* ── Interactive Map & Visiting Details Section ──────────────── */}
      <VisitCampusSection isHomeSection={false} />

      {/* ── How to Reach & Transit Guidance ─────────────────────────── */}
      <section className="visit-transit-section">
        <div className="container">
          <div className="visit-transit__header">
            <span className="visit-transit__tag">Transit &amp; Commute</span>
            <h2 className="visit-transit__title">Getting to the Campus</h2>
            <p className="visit-transit__desc">
              Situated in a quiet, pollution-free educational enclave with direct arterial connectivity.
            </p>
          </div>

          <div className="visit-transit__grid">
            <div className="visit-transit-card">
              <div className="visit-transit-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <h3>By Personal Car or Taxi</h3>
              <p>Direct entry via Sector 12 Main Avenue from the GT Karnal Road. Visitor parking is available inside Gate 1 with complimentary charging slots for electric vehicles.</p>
            </div>

            <div className="visit-transit-card">
              <div className="visit-transit-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="7.01" y2="15"/><line x1="11" y1="15" x2="13" y2="15"/></svg>
              </div>
              <h3>Bus &amp; Transit Stops</h3>
              <p>The City Center Bus Terminal is a short 5-minute auto-rickshaw ride away. Regular commuter buses connect directly to the Sector 12 community intersection.</p>
            </div>

            <div className="visit-transit-card">
              <div className="visit-transit-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3>Gate Protocol &amp; Security</h3>
              <p>All visitors are requested to present a valid photo ID at Security Gate 1 to receive a Visitor Badge. A dedicated admissions escort will meet you at the reception lobby.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Tour Booking CTA ─────────────────────────────────── */}
      <section className="visit-bottom-cta">
        <div className="container visit-bottom-cta__inner">
          <div className="visit-bottom-cta__content">
            <h2>Ready to Schedule Your Campus Walkthrough?</h2>
            <p>Tours run every working morning. Share your preferred date and class of interest, and our admissions coordinators will confirm your session.</p>
          </div>
          <div className="visit-bottom-cta__actions">
            <Link to="/appointments" className="visit-cta-btn visit-cta-btn--gold">
              Book In-Person Tour / Appointment
            </Link>
            <Link to="/fees-scholarships" className="visit-cta-btn visit-cta-btn--outline">
              View Fee Structure
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
