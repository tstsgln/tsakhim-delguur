'use client';

import { useEffect } from 'react';

/**
 * Registers the PWA service worker (/sw.js) after the page has loaded.
 * Mounted once in the root layout. The worker itself is intentionally minimal
 * (see public/sw.js) — it only enables installability and an offline fallback.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registration failures are non-fatal — the site works without it */
      });
    };
    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
