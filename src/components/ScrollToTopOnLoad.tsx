'use client';

import { useEffect } from 'react';

/**
 * Forces the window to the top on a full page load (refresh / direct visit).
 * Lives in the root layout so it mounts once per hard load — it does NOT run on
 * client-side navigations or back/forward, so Next.js's own scroll handling for
 * those is left intact. Setting scrollRestoration to 'manual' stops the browser
 * from restoring the previous scroll position on the next reload.
 */
export default function ScrollToTopOnLoad() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
}
