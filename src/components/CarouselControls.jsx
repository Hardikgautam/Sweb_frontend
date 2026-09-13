// src/components/CarouselControls.jsx
// Mobile/Tablet swipeable carousel navigation controls: previous/next buttons & interactive dot indicators.

import './CarouselControls.css';

export default function CarouselControls({
  total,
  activeIndex,
  onPrev,
  onNext,
  onSelect,
  className = '',
  ariaLabel = 'Carousel navigation',
}) {
  if (!total || total <= 1) return null;

  return (
    <div className={`carousel-controls ${className}`} aria-label={ariaLabel}>
      <button
        type="button"
        className="carousel-controls__btn carousel-controls__btn--prev"
        onClick={onPrev}
        disabled={activeIndex === 0}
        aria-label="Previous card"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="carousel-controls__dots" role="tablist" aria-label="Item indicators">
        {Array.from({ length: total }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={activeIndex === idx}
            aria-label={`Go to item ${idx + 1} of ${total}`}
            className={`carousel-controls__dot ${activeIndex === idx ? 'active' : ''}`}
            onClick={() => onSelect(idx)}
          />
        ))}
      </div>

      <button
        type="button"
        className="carousel-controls__btn carousel-controls__btn--next"
        onClick={onNext}
        disabled={activeIndex === total - 1}
        aria-label="Next card"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
