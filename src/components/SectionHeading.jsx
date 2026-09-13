// components/SectionHeading.jsx
// Renders the gold kicker line + numbered label + main heading.
//
// Props:
//   number  — section number string, e.g. "01"
//   label   — short uppercase label, e.g. "ACADEMICS"
//   title   — main heading text
//   light   — if true, uses light colour variant (for navy backgrounds)
//   center  — if true, centres the text

import './SectionHeading.css';

export default function SectionHeading({
  number,
  label,
  title,
  light = false,
  center = false,
}) {
  const classes = [
    'section-heading',
    light ? 'section-heading--light' : '',
    center ? 'section-heading--center' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="section-heading__kicker">
        <span className="section-heading__kicker-line" aria-hidden="true" />
        <span className="section-heading__kicker-text">
          {number && `${number} `}{label}
        </span>
      </div>
      <h2 className="section-heading__title">{title}</h2>
    </div>
  );
}
