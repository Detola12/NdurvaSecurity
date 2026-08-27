import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * The HTML shell for the web build, and the only place a PWA can be declared:
 * Expo's Metro web output does not generate a manifest or register a worker.
 *
 * Rendered once at build time for the static export, so nothing here runs in
 * the app — it is the document the app boots into.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover so the layout reaches under the notch, and
            user-scalable=no because a guard tapping a keypad one-handed in the
            dark should never pinch-zoom the screen by accident. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        <title>Ndurva Security</title>
        <meta
          name="description"
          content="Check resident and visitor codes at the gate, and log who comes in and who leaves."
        />

        {/* The app is served under /security on ndurva.com rather than on a
            domain of its own, so every absolute path here carries that prefix.
            Expo's baseUrl rewrites the bundle and its own favicon; anything
            hand-written, like these, it never sees. */}
        <link rel="manifest" href="/security/manifest.webmanifest" />
        <meta name="theme-color" content="#0D0D0D" />
        <meta name="color-scheme" content="dark" />

        {/* iOS ignores the manifest for both of these. */}
        <link rel="apple-touch-icon" href="/security/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ndurva Gate" />

        {/* Expo's own reset: stops the body scrolling behind fixed content. */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: shellStyle }} />
        <script dangerouslySetInnerHTML={{ __html: registerServiceWorker }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

/**
 * Painted before the bundle parses, so the first frame is the app's own dark
 * rather than a white flash — which on a phone at night is the difference
 * between opening the app and being blinded by it.
 */
const shellStyle = `
  html, body, #root { background-color: #0D0D0D; }
  body { overscroll-behavior-y: none; }
`;

/**
 * Registers the worker after load, so it never competes with the first render.
 *
 * A new worker reloads the page once — tracked by a flag so a redeploy cannot
 * put a guard in a reload loop mid-shift.
 */
const registerServiceWorker = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      // Served from /security/, which is also the widest scope a worker at
      // that path is allowed to claim — so it controls the gate app and
      // nothing else on ndurva.com.
      navigator.serviceWorker.register('/security/sw.js', { scope: '/security/' }).catch(function () {});
      var reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (reloading) return;
        reloading = true;
        window.location.reload();
      });
    });
  }
`;
