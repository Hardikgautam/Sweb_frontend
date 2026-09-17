// src/hooks/useVisitorTracking.js
import { useEffect } from 'react';
import { pingVisitor } from '../api/analytics';

const SESSION_STORAGE_KEY = 'school_site_session_tracked';

/**
 * Tracks unique visits once per browser session.
 * Does not make excessive network calls or re-ping on internal route navigation.
 */
export function useVisitorTracking() {
  useEffect(() => {
    try {
      const alreadyTracked = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!alreadyTracked) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, Date.now().toString());
        pingVisitor(window.location.pathname || '/');
      }
    } catch {
      // In case sessionStorage is blocked (e.g. strict incognito), attempt one-off ping
      pingVisitor(window.location.pathname || '/');
    }
  }, []);
}
