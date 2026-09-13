// components/Card.jsx
// Generic content card: gold top border, white bg, hover shadow lift.
//
// Props:
//   icon     — emoji or element for the card icon (optional)
//   title    — card heading
//   children — card body content

import './Card.css';

export default function Card({ icon, title, children, className = '' }) {
  return (
    <div className={`card ${className}`.trim()}>
      {icon && <span className="card__icon" aria-hidden="true">{icon}</span>}
      {title && <h3 className="card__title">{title}</h3>}
      {children && <p className="card__body">{children}</p>}
    </div>
  );
}
