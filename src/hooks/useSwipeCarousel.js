import { useState, useRef, useCallback } from 'react';

/**
 * useSwipeCarousel — Lightweight hook for managing native CSS scroll-snap carousel state.
 * Synchronizes dot indicators with touch swipe and enables programmatic jump/arrow navigation.
 *
 * @param {number} totalItems - Total count of cards in the carousel
 */
export function useSwipeCarousel(totalItems) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    if (!children.length) return;

    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    children.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(containerCenter - cardCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    setActiveIndex((prev) => (prev !== closestIndex ? closestIndex : prev));
  }, []);

  const scrollToIndex = useCallback((index) => {
    const el = trackRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    const target = children[index];
    if (target) {
      const targetScroll = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2;
      el.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setActiveIndex(index);
    }
  }, []);

  const scrollPrev = useCallback(() => {
    scrollToIndex(Math.max(0, activeIndex - 1));
  }, [activeIndex, scrollToIndex]);

  const scrollNext = useCallback(() => {
    scrollToIndex(Math.min(totalItems - 1, activeIndex + 1));
  }, [activeIndex, totalItems, scrollToIndex]);

  return {
    trackRef,
    activeIndex,
    handleScroll,
    scrollToIndex,
    scrollPrev,
    scrollNext,
  };
}
