# Ndurva Security

The gate app. A security guard types or scans a code, sees whose pass it is,
and checks the person in or out. That is the whole product.

React Native, Expo SDK 57, expo-router, TypeScript.

## Running it

```bash
npm install
npm start          # then scan the QR with Expo Go, or press a/i
npm run android
npm run ios        # needs macOS
npm run typecheck
```

Any password signs you in while the API is still stubbed. Codes to try:

| Code | What happens |
| --- | --- |
| `482212` | Guest, Emeka Adinuke, two-way, the pass from the design |
| `482913` | Resident, Chisom Okafor, does not expire |
| `118342` | Guest, one-way, already checked in |
| `660271` | Rejected, the pass expired |
| `904417` | Rejected, the resident cancelled it |
| anything else | "Wrong code please try again" |

## Screens

| Route | What it is |
| --- | --- |
| `app/sign-in.tsx` | Email and password, forgot password, biometric option. |
| `app/(app)/index.tsx` | The keypad. Home, per the design. |
| `app/(app)/scan.tsx` | Camera, reached from the keypad. Reticle, torch, typed fallback. |
| `app/(app)/pass.tsx` | The pass, with Check In and Check Out. |
| `app/(app)/account.tsx` | This shift's passes, and sign out. Not in the Figma. |

Built against the Figma security screens (`node-id=110-22378`), which is the
source of truth for the layout, the light palette, and the keypad-first flow.

## Decisions worth knowing

**A guard sees a name, a unit and a pass. Nothing else.** No contact details,
no payment status, no other property. The `Pass` type in
`src/data/verification.ts` is the access boundary: widening it is a decision
someone has to make deliberately, not something that happens by adding a field
to a screen.

**One property per account.** It comes from the session, and there is no UI
anywhere that could change it. That is the guard account model from the PRD,
enforced by there being nothing to enforce.

**Looking a code up is not the same as passing through.** Check In and Check
Out are separate deliberate actions, so opening a pass records nothing. A
rejected code records nothing at all.

**Typing is the home screen and scanning is secondary**, per the design. It is
also the right way round in practice: a guest reading a code off a text message
is the common case, a printed QR is not. The keypad is on screen rather than
the system keyboard, because it is always exactly six digits and the targets
can be far bigger that way.

**A wrong code stays on the keypad** and says so inline, rather than pushing a
rejection screen the guard has to back out of.

**Check out is disabled until check in has happened**, and a one-way pass never
offers it. Nothing in the design says this, but a check out with no check in is
a record of something that did not happen.

**The scanner is not in the Figma.** It is the second half of a flow the design
does specify, since the keypad offers "Scan Resident QR Code". It reads QR only,
frames the code in a reticle cut out of a scrim (a printed code is mostly white
paper, and white chrome over it is unreadable), offers the torch for a dark gate,
and always keeps "Type the code instead" on screen. A rejected code stays on the
camera and says why, rather than bouncing the guard back to the keypad.

**Barcode scanning does not work on Expo web.** The web build needs a
`BarcodeDetector`, which most desktop browsers do not ship. Everything else on
the screen renders there; scanning itself is native-only.

**Scans are debounced.** `onBarcodeScanned` fires many times a second while a
code is in frame; without the guard, one scan pushes a stack of duplicate
result screens.

## Not done yet

- **No API.** `src/data/verification.ts` and `src/data/session.ts` are local
  seed data behind async functions. Swapping in real endpoints means changing
  those two files and nothing else.
- **No offline queue.** Gates lose signal. Movements logged while offline
  should be queued and synced, and that is not built.
- **No push.** A resident cancelling a pass mid-visit will not reach a guard
  who already has the screen open.
- **Icons are the Expo defaults.** The brand mark is used in the app, but
  `assets/` still holds the template's launcher icon and splash.
- **Biometric sign in is disabled.** The button is in the design, but it needs a
  real token to unlock, so it is visibly unavailable rather than pretending.
- **The account screen is not in the Figma.** Added because signing out has to
  live somewhere. Replace it if the design covers this later.
- **Sign-in accepts any password.** It has to, until there is an API.

## Running it on the web

The gate app also ships as an installable PWA, so a guard can add it to a
home screen instead of waiting on an app store.

```bash
npm run web        # dev server
npm run build:web  # static export into dist/
```

Serve `dist/` from any static host. Two things it needs in production:

- **HTTPS.** Service workers and the camera both refuse to run without it.
- **`/api` proxied on the same origin**, or the service worker's exclusion for
  it will not match. It deliberately never caches API responses: a stale answer
  about whether a pass is valid would open a gate on a pass revoked an hour ago.

### Where it is served

`ndurva.com/security`, not a subdomain of its own — which is why
`experiments.baseUrl` in `app.json` is `/security`, the manifest's `start_url`
and `scope` are `/security/`, and the worker is registered from
`/security/sw.js`, that being the widest scope a worker at that path may claim.

The main site rewrites `/security/:path*` to this project with the prefix
stripped, so this project still serves from its own root; `baseUrl` is what
makes the app emit `/security/`-prefixed links for the browser. The prefix is
accepted here directly too, so a preview deployment works on its own URL.

Moving the app elsewhere means changing four things together: `baseUrl`, the
manifest, the registration path, and the main site's rewrite. The worker itself
derives its base from where it is served, so it needs no edit.

### What the service worker does

Precaches the app shell, so the app opens on a dead connection rather than
showing the browser's offline page — a gate house is often on the edge of a
signal, and typing in a code read out over the phone still works with the
network away. Navigations try the network first so a deploy is picked up;
hashed assets are served from cache.

### Known limits on the web

- **QR scanning does not work in Safari on iOS.** `expo-camera` scans through
  the browser's `BarcodeDetector`, which Chrome on Android has and Safari does
  not. Typing the code — the home screen's primary path — works everywhere, so
  the app is usable on an iPhone; the scanner is not.
- **Push notifications** need the app installed to the home screen on iOS, and
  are unreliable there generally.
