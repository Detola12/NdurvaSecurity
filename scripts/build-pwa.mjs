/**
 * Runs after `expo export`, and finishes what Expo's web output does not do for
 * a PWA: tells the service worker exactly what this build consists of.
 *
 * - Copies ZXing's WebAssembly decoder into the build, so the web scanner loads
 *   it from our own origin (see src/lib/scanner.web.ts).
 * - Writes the list of files to precache into dist/sw.js. Without it the worker
 *   only caches the bundle if the page happens to fetch it after the worker has
 *   taken control, which on a first visit it usually has not: install the app,
 *   lose signal, and it opens on a blank screen.
 * - Versions the worker by a hash of those files. A deploy then changes sw.js,
 *   so the browser installs the new worker and drops the old build's cache,
 *   instead of serving a stale shell until someone bumps a number by hand.
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = "dist";
const SW = join(DIST, "sw.js");

// The decoder has to be the exact build the polyfill will ask for: the version
// comes from the polyfill itself, and the file from the zxing-wasm that
// barcode-detector resolves to, found the way Node would look for it.
const { ZXING_WASM_VERSION } = await import("barcode-detector/ponyfill");
const detectorEntry = fileURLToPath(import.meta.resolve("barcode-detector/ponyfill"));
let zxingDir = null;
for (let dir = dirname(detectorEntry); !zxingDir && dir !== dirname(dir); dir = dirname(dir)) {
  const candidate = join(dir, "node_modules", "zxing-wasm");
  if (existsSync(join(candidate, "package.json"))) zxingDir = candidate;
}
const wasmIn = zxingDir && join(zxingDir, "dist", "reader", "zxing_reader.wasm");
if (!wasmIn || !existsSync(wasmIn)) throw new Error("build-pwa: could not find zxing-wasm's zxing_reader.wasm.");
const { version } = JSON.parse(readFileSync(join(zxingDir, "package.json"), "utf8"));
if (version !== ZXING_WASM_VERSION) {
  throw new Error(`build-pwa: barcode-detector wants zxing-wasm ${ZXING_WASM_VERSION}, found ${version}.`);
}
const wasmOut = join(DIST, "zxing", ZXING_WASM_VERSION, "zxing_reader.wasm");
mkdirSync(dirname(wasmOut), { recursive: true });
copyFileSync(wasmIn, wasmOut);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

// Relative to the worker, which resolves them against wherever it is served.
// The other HTML pages are left out on purpose: every route renders the same
// shell, and the worker falls back to index.html for any navigation.
const files = [
  join(DIST, "index.html"),
  join(DIST, "manifest.webmanifest"),
  join(DIST, "favicon.ico"),
  ...walk(join(DIST, "icons")),
  ...walk(join(DIST, "_expo", "static")),
  ...walk(join(DIST, "zxing")),
].sort();

const hash = createHash("sha256");
for (const file of files) hash.update(file).update(readFileSync(file));
const cacheVersion = `ndurva-gate-${hash.digest("hex").slice(0, 12)}`;

const precache = files.map((file) => {
  const path = relative(DIST, file).split(sep).join("/");
  return path === "index.html" ? "./" : path;
});

const source = readFileSync(SW, "utf8");
const stamped = source
  .replace(/^const VERSION = "ndurva-gate-dev";$/m, `const VERSION = ${JSON.stringify(cacheVersion)};`)
  .replace(/^const PRECACHE = \[\];$/m, `const PRECACHE = ${JSON.stringify(precache)};`);

// A worker that silently shipped unstamped would still work online and fail
// only once a gate loses signal, which is the worst time to find out.
if (!stamped.includes(cacheVersion) || stamped.includes("const PRECACHE = [];")) {
  throw new Error(`build-pwa: could not stamp ${SW}; its VERSION or PRECACHE line has changed shape.`);
}
writeFileSync(SW, stamped);

const bytes = files.reduce((sum, file) => sum + statSync(file).size, 0);
console.log(`build-pwa: ${cacheVersion}, ${precache.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB precached`);
