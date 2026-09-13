// components/StatsStrip.jsx
// Horizontal stats bar directly below the Hero section.
// Content is imported from statsContent.js — edit that file, not here.

import { statsContent } from '../config/statsContent';
import './StatsStrip.css';

export default function StatsStrip() {
  return (
    <section className="stats-strip" aria-label="Key Statistics">
      <div className="container">
        <div className="stats-strip__grid">
          {statsContent.map((stat, index) => (
            <div key={index} className="stats-strip__item">
              <span className="stats-strip__value">{stat.value}</span>
              <span className="stats-strip__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
