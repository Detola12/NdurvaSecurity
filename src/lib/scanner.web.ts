/**
 * Where the web scanner's decoder comes from.
 *
 * Browsers without a native BarcodeDetector — Safari on iOS, desktop Firefox —
 * get expo-camera's polyfill, which decodes with ZXing compiled to a 1 MB
 * WebAssembly file. Left alone it fetches that file from a public CDN the first
 * time the scanner opens, so scanning needs a working connection and a third
 * party's uptime. Pointed here instead, it comes from our own origin, where the
 * service worker has already precached it (scripts/build-pwa.mjs copies it into
 * the build), and the scanner works on a dead connection like the rest of the
 * app.
 *
 * The import is dynamic so the polyfill stays in its own chunk, the one
 * expo-camera loads anyway; it is started at app load so the override is in
 * place before the scanner ever asks for the decoder.
 */
export function prepareScanner() {
  // The static export renders every route once in Node; there is no scanner there.
  if (typeof window === "undefined") return;
  const base = process.env.EXPO_BASE_URL ?? "";
  void import("barcode-detector/ponyfill")
    .then(({ setZXingModuleOverrides, ZXING_WASM_VERSION }) => {
      setZXingModuleOverrides({
        locateFile: (path: string, prefix: string) =>
          path.endsWith(".wasm") ? `${base}/zxing/${ZXING_WASM_VERSION}/${path}` : prefix + path,
      });
    })
    // Without the override the polyfill still works, from the CDN.
    .catch(() => {});
}
