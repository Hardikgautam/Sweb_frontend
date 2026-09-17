// pages/SubjectPage.jsx
// Generic subject detail page — renders from subjectsData.js based on `subjectKey` prop.
// Layout: video hero → stats banner → curriculum bands → gallery → CTA
// Matches the site's navy/maroon/gold/cream design system.

import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { subjectsData } from '../config/subjectsData';
import { openEnquiryModal } from '../api/enquiries';
import { publicUrl } from '../utils/publicUrl';
import './SubjectPage.css';

// Authoritative mapping for all subject keys, slugs, and 1-indexed / 0-indexed IDs
const SUBJECT_LOOKUP = {
  // Slugs & keys
  languages: subjectsData.languages,
  mathematics: subjectsData.mathematics,
  math: subjectsData.mathematics,
  science: subjectsData.science,
  social: subjectsData.social,
  'social-studies': subjectsData.social,
  computer: subjectsData.computer,
  'computer-science': subjectsData.computer,
  arts: subjectsData.arts,
  'arts-music-sports': subjectsData.arts,

  // 1-indexed database IDs (seed.py: 1=Languages, 2=Math, 3=Science, 4=Social, 5=Computer, 6=Arts)
  '1': subjectsData.languages,
  '2': subjectsData.mathematics,
  '3': subjectsData.science,
  '4': subjectsData.social,
  '5': subjectsData.computer,
  '6': subjectsData.arts,

  // 0-indexed fallback
  '0': subjectsData.languages,
};

export default function SubjectPage({ data: propData }) {
  const { id } = useParams();
  const subjectData = propData || (id ? SUBJECT_LOOKUP[String(id).toLowerCase().trim()] : null);

  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Subject Not Found Fallback UI
  if (!subjectData) {
    return (
      <main className="subject-page subject-page--not-found">
        <div
          className="container"
          style={{
            padding: '8rem 1.5rem',
            textAlign: 'center',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              color: 'var(--color-gold, #c5a059)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
            }}
          >
            Curriculum
          </p>
          <h1
            style={{
              fontSize: '2.5rem',
              color: 'var(--color-navy, #0f2b48)',
              marginBottom: '1rem',
              fontFamily: 'var(--font-heading, serif)',
            }}
          >
            Subject Not Found
          </h1>
          <p style={{ color: '#666', maxWidth: '540px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            The requested subject {id ? `("${id}")` : ''} could not be found. Please select from our available curriculum subjects below:
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
              marginBottom: '2.5rem',
            }}
          >
            <Link to="/subjects/languages" className="btn btn--outline" style={{ padding: '0.6rem 1.2rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>Languages</Link>
            <Link to="/subjects/mathematics" className="btn btn--outline" style={{ padding: '0.6rem 1.2rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>Mathematics</Link>
            <Link to="/subjects/science" className="btn btn--outline" style={{ padding: '0.6rem 1.2rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>Science</Link>
            <Link to="/subjects/social-studies" className="btn btn--outline" style={{ padding: '0.6rem 1.2rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>Social Studies</Link>
            <Link to="/subjects/computer" className="btn btn--outline" style={{ padding: '0.6rem 1.2rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>Computer Science</Link>
            <Link to="/subjects/arts" className="btn btn--outline" style={{ padding: '0.6rem 1.2rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>Arts & Sports</Link>
          </div>
          <Link to="/" className="btn btn--cta-gold" style={{ textDecoration: 'none' }}>
            ← Return to Home
          </Link>
        </div>
      </main>
    );
  }

  const { title, kicker, levels, video, poster, fallbackImage, intro, stats, gradeBands, highlights, cta } = subjectData;
  const heroImgSrc = poster || fallbackImage || publicUrl('images/image1.jpg');

  // Ensure autoplay works cross-browser and resumes after tab switch
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // Critical cross-browser fix: explicitly set DOM properties for autoplay policy
    vid.muted = true;
    vid.defaultMuted = true;
    vid.playsInline = true;

    // Reset failure state on data/video prop change
    setVideoFailed(false);
    setVideoPlaying(false);

    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setVideoPlaying(true);
        })
        .catch((err) => {
          console.warn(`[SubjectPage] Autoplay policy prevented video playback for ${title}, falling back to static hero image:`, err);
          setVideoFailed(true);
        });
    }

    const handleVisibility = () => {
      if (!document.hidden && vid.paused && !videoFailed) {
        vid.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [video, title, videoFailed]);

  return (
    <main className="subject-page">

      {/* ─── 1. HERO ─────────────────────────────────────────────── */}
      <section className="sp-hero" aria-label={`${title} hero`}>
        {/* Permanent static fallback image (always underneath, visible instantly) */}
        <img
          src={heroImgSrc}
          alt={`${title} classroom`}
          className="sp-hero__fallback-img"
          aria-hidden="true"
        />

        {/* Hero background video (fades in when playing, hides on error) */}
        {!videoFailed && (
          <video
            ref={videoRef}
            className={`sp-hero__video ${videoPlaying ? 'sp-hero__video--playing' : ''}`}
            src={video}
            poster={heroImgSrc}
            autoPlay
            muted
            loop
            playsInline
            onPlaying={() => setVideoPlaying(true)}
            onError={(e) => {
              console.warn(`[SubjectPage] Error loading video ${video}:`, e);
              setVideoFailed(true);
            }}
            aria-hidden="true"
          />
        )}
        <div className="sp-hero__overlay" />

        <div className="sp-hero__content container">
          <p className="sp-hero__kicker">
            <span className="sp-hero__kicker-line" aria-hidden="true" />
            {kicker}
          </p>
          <h1 className="sp-hero__title">{title}</h1>
          <p className="sp-hero__levels">{levels}</p>
          <p className="sp-hero__intro">{intro}</p>
          <div className="sp-hero__actions">
            {cta.primaryButtonLink.startsWith('#') || cta.isModal ? (
              <button
                className="btn btn--cta-gold"
                onClick={() => openEnquiryModal()}
              >
                {cta.primaryButtonText}
              </button>
            ) : (
              <Link to={cta.primaryButtonLink} className="btn btn--primary">
                {cta.primaryButtonText}
              </Link>
            )}
          </div>
        </div>

        <div className="sp-hero__scroll-hint" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ─── 2. STATS BANNER ─────────────────────────────────────── */}
      <section className="sp-stats" aria-label="Key figures">
        <div className="container sp-stats__grid">
          {stats.map((s, i) => (
            <div className="sp-stats__item" key={i}>
              <span className="sp-stats__number">{s.number}</span>
              <span className="sp-stats__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. CURRICULUM BANDS ─────────────────────────────────── */}
      <section className="sp-curriculum section-pad" aria-label="Curriculum breakdown">
        <div className="container">
          <div className="sp-section-header">
            <span className="sp-section-header__kicker">
              <span className="sp-section-header__kicker-line" aria-hidden="true" />
              CURRICULUM OVERVIEW
            </span>
            <h2 className="sp-section-header__title">Grade-by-Grade Learning Journey</h2>
            <p className="sp-section-header__sub">
              A structured, progressive curriculum ensuring every student builds on a solid foundation.
            </p>
          </div>

          <div className="sp-bands">
            {gradeBands.map((band, i) => (
              <article className="sp-band" key={i}>
                <div className="sp-band__left">
                  <span className="sp-band__badge">{band.badge}</span>
                  <h3 className="sp-band__title">{band.title}</h3>
                  <p className="sp-band__focus">{band.focus}</p>
                </div>
                <div className="sp-band__divider" aria-hidden="true" />
                <ul className="sp-band__points">
                  {band.points.map((pt, j) => (
                    <li key={j}>
                      <span className="sp-band__bullet" aria-hidden="true">
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="3"/></svg>
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. GALLERY STRIP ────────────────────────────────────── */}
      <section className="sp-gallery section-pad sp-gallery--navy" aria-label="Gallery">
        <div className="container">
          <div className="sp-section-header sp-section-header--light">
            <span className="sp-section-header__kicker sp-section-header__kicker--light">
              <span className="sp-section-header__kicker-line" aria-hidden="true" />
              CAMPUS LIFE
            </span>
            <h2 className="sp-section-header__title sp-section-header__title--light">
              Inside the Classroom & Beyond
            </h2>
          </div>

          <div className="sp-gallery__grid">
            {highlights.map((img, i) => (
              <figure className="sp-gallery__card" key={i}>
                <div className="sp-gallery__img-wrap">
                  <img
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                    className="sp-gallery__img"
                  />
                  <div className="sp-gallery__img-overlay" />
                </div>
                <figcaption className="sp-gallery__caption">
                  <h4 className="sp-gallery__caption-title">{img.title}</h4>
                  <p className="sp-gallery__caption-desc">{img.desc}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. CLOSING CTA BANNER ───────────────────────────────── */}
      <section className="sp-cta-banner" aria-label="Call to action">
        {/* decorative watermark */}
        <div className="sp-cta-banner__watermark" aria-hidden="true">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="100" cy="100" r="95" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="88" strokeDasharray="4 3" strokeWidth="1" />
            <circle cx="100" cy="100" r="80" strokeWidth="1" />
            <path d="M70 145c15-8 30-8 30-8s15 0 30 8v-50c-15-8-30-8-30-8s-15 0-30 8v50z" strokeWidth="2" />
            <line x1="100" y1="87" x2="100" y2="137" strokeWidth="1.5" />
            <path d="M100 48c0 0-14 12-8 26 4 10 8 13 8 13s4-3 8-13c6-14-8-26-8-26z" strokeWidth="1.8" />
            <polygon points="100,20 102,26 108,26 103,30 105,36 100,32 95,36 97,30 92,26 98,26" fill="currentColor" />
          </svg>
        </div>

        <div className="container sp-cta-banner__inner">
          <p className="sp-cta-banner__kicker">
            <span className="sp-cta-banner__kicker-line" aria-hidden="true" />
            {cta.kicker}
          </p>
          <h2 className="sp-cta-banner__headline">{cta.headline}</h2>
          <p className="sp-cta-banner__paragraph">{cta.paragraph}</p>

          <div className="sp-cta-banner__actions">
            {/* Primary action */}
            {cta.primaryButtonLink.startsWith('/e-books') ? (
              <Link to={cta.primaryButtonLink} className="btn btn--cta-gold sp-cta-btn-primary">
                {cta.primaryButtonText}
              </Link>
            ) : (
              <button
                className="btn btn--cta-gold sp-cta-btn-primary"
                onClick={() => openEnquiryModal()}
              >
                {cta.primaryButtonText}
              </button>
            )}

            {/* Secondary: always opens enquiry modal */}
            <button
              className="btn btn--cta-outlined-light sp-cta-btn-secondary"
              onClick={() => openEnquiryModal()}
            >
              {cta.secondaryButtonText}
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}
