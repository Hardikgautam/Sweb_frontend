// components/ScrollToTop.jsx
// Automatically scrolls window to top on route change,
// or scrolls smoothly to target section if a hash anchor is present (e.g. #academics).

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      // Slight delay to ensure target DOM elements have mounted after route transition
      const timer = setTimeout(() => {
        const targetEl = document.getElementById(id);
        if (targetEl) {
          const navOffset = 72; // height of fixed navbar
          const targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - navOffset;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}
