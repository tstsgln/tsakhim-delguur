// Minimal, SSR-safe service worker for tsetseglen.mn.
//
// It exists mainly to make the site an installable PWA and to show a friendly
// offline page. It deliberately does NOT cache HTML, server actions, RSC
// payloads, API responses, or anything POSTed — caching those would serve stale
// auth state or break the server-rendered marketplace. It only intercepts
// top-level GET navigations (network-first, offline-page fallback) and otherwise
// gets out of the browser's way.

const CACHE = "tsetseglen-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Only full-page navigations; everything else passes through untouched.
  if (request.mode !== "navigate" || request.method !== "GET") return;
  event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
});
