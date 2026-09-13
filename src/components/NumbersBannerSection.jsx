// components/NumbersBannerSection.jsx
// Section 03: Full-width dark navy banner with 4 stat columns.
// All copy is imported from bannerStatsContent.js — edit that file, not here.

import { bannerStatsContent } from '../config/bannerStatsContent';
import './NumbersBannerSection.css';

export default function NumbersBannerSection() {
  const { kickerNumber, kickerLabel, headlineLines, stats } = bannerStatsContent;

  return (
    <section id="numbers" className="numbers-banner" aria-label="Key Numbers">
      <div className="container">

        {/* ── Header: Kicker + Off-white serif headline ──────────────── */}
        <div className="numbers-banner__header">
          <div className="numbers-banner__kicker">
            <span className="numbers-banner__kicker-line" aria-hidden="true" />
            <span className="numbers-banner__kicker-text">
              {kickerNumber} &nbsp;{kickerLabel}
            </span>
          </div>

          <h2 className="numbers-banner__headline">
            {headlineLines.map((line, idx) => (
              <span key={idx}>{line}</span>
            ))}
          </h2>
        </div>

        {/* ── 4 Stat Columns ─────────────────────────────────────────── */}
        <div className="numbers-banner__grid">
          {stats.map((item, idx) => (
            <div key={idx} className="numbers-banner__stat-col">
              <span className="numbers-banner__stat-number">{item.value}</span>
              <p className="numbers-banner__stat-label">{item.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
