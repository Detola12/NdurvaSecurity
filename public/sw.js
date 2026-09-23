/**
 * Service worker for the gate app.
 *
 * A guard's phone sits in a gate house, often on the edge of a signal. The app
 * shell is precached so it opens on a dead connection instead of showing the
 * browser's offline page, and a manager can still read a code out over the
 * phone while the network is away.
 *
 * What is deliberately NOT cached: anything that looks like an API call. A
 * stale answer about whether a pass is valid is worse than no answer — it would
 * open a gate on a pass revoked an hour ago. Those requests go to the network
 * or they fail.
 *
 * The app lives under /security on ndurva.com rather than on a domain of its
 * own, so BASE is the root of everything here: the worker's own scope, the
 * shell it falls back to, and the paths it precaches. Derived from where this
 * file is served rather than written down, so moving the app is a matter of
 * moving the files.
 */

// Both stamped by scripts/build-pwa.mjs at build time: the version from a hash
// of the build, so every deploy installs a fresh worker and clears the last
// build's cache, and the list with every file the build produced. Left as they
// are under `npm run web`, where there is no build to list.
const VERSION = "ndurva-gate-dev";
const PRECACHE = [];

const SHELL = `${VERSION}-shell`;

/** "/security/" — the directory this worker was served from. */
const BASE = new URL("./", self.location).pathname;

// The whole app — bundle, icons, the scanner's decoder — so an installed app
// opens and works on its very first offline launch, not only once the pages
// it needs have happened to be fetched while this worker was in control.
const CORE = [
  BASE,
  `${BASE}manifest.webmanifest`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,
  ...PRECACHE.map((path) => new URL(path, `${self.location.origin}${BASE}`).pathname),
].filter((url, i, all) => all.indexOf(url) === i);

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

  // Someone else's origin, or an API call. Neither is ours to cache.
  //
  // The API is matched anywhere in the path, not just at the root: a page
  // inside our scope can call /backend/... or /security/api/..., and both
  // reach this worker. Whichever the backend ends up being served at, a
  // verification must not come from a cache.
  if (url.origin !== self.location.origin) return;
  if (/(^|\/)(api|backend)\//.test(url.pathname)) return;

  // Navigations: try the network so a deployed change is picked up, and fall
  // back to the cached shell when there is nothing to reach.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only a good answer is worth keeping. Caching the response to every
          // navigation lets a single 404 — a mistyped URL, a route dropped by a
          // deploy — overwrite the shell, and the app then opens offline on that
          // error page instead of the login screen.
          if (response.ok) {
            const copy = response.clone();
            void caches.open(SHELL).then((cache) => cache.put(BASE, copy));
          }
          return response;
        })
        .catch(() => caches.match(BASE).then((cached) => cached ?? Response.error())),
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
