/**
 * Service worker for the gate app.
 *
 * A guard's phone sits in a gate house, often on the edge of a signal. The app
 * shell is precached so it opens on a dead connection instead of showing the
 * browser's offline page, and a manager can still read a code out over the
 * phone while the network is away.
 *
 * What is deliberately NOT cached: anything under /api. A stale answer about
 * whether a pass is valid is worse than no answer — it would open a gate on a
 * pass revoked an hour ago. Those requests go to the network or they fail.
 */

const VERSION = "ndurva-gate-v1";
const SHELL = `${VERSION}-shell`;

// Filled at install with whatever the build produced, plus the entry points
// that are stable across builds.
const CORE = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      // Individually, so one missing file does not fail the whole install and
      // leave the app with no worker at all.
      .then((cache) => Promise.allSettled(CORE.map((url) => cache.add(url))))
      // The new worker takes over as soon as it is ready; the page reloads
      // itself once, below, so nobody is left on a half-updated build.
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Someone else's origin, or the API. Neither is ours to cache.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: try the network so a deployed change is picked up, and fall
  // back to the cached shell when there is nothing to reach.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(SHELL).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() => caches.match("/").then((cached) => cached ?? Response.error())),
    );
    return;
  }

  // Everything else — the JS bundle, icons, fonts — is content-hashed by the
  // build, so a cached copy is the right copy and the network is only for
  // things not seen before.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            void caches.open(SHELL).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
