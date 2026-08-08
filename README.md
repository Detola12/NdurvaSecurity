# Ndurva Security

The gate app. A security guard scans or types a code, sees whether to let the
person through, and logs which way they went. That is the whole product.

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
| `482913` | Resident, Chisom Okafor, 4 registered people |
| `118342` | Visitor, Daniel Umeh, visiting Chisom Okafor |
| `660271` | Denied, the pass expired |
| `904417` | Denied, the resident cancelled it |
| anything else | Denied, no pass found |

## Screens

| Route | What it is |
| --- | --- |
| `app/sign-in.tsx` | Email and password. The property comes from the account. |
| `app/(app)/scan.tsx` | Camera with a reticle, a torch, and a way to type instead. |
| `app/(app)/manual.tsx` | Six digit keypad, for a flat phone or a cracked screen. |
| `app/(app)/result.tsx` | Allow or deny, then log entry or exit. |
| `app/(app)/activity.tsx` | This shift's movements, and sign out. |

## Decisions worth knowing

**A guard sees a name, a unit and a verdict. Nothing else.** No contact
details, no payment status, no other property. The types in
`src/data/verification.ts` are the access boundary: widening `VerifiedPass` is
a decision someone has to make deliberately, not something that happens by
adding a field to a screen.

**One property per account.** It comes from the session, and there is no UI
anywhere that could change it. That is the guard account model from the PRD,
enforced by there being nothing to enforce.

**Verifying is not the same as passing through.** The log is written only after
the guard says which way the person went, and there is a "just checking" exit
that logs nothing. A denied code logs nothing at all.

**Dark only.** Guards work nights. A white screen at 2am ruins night vision and
lights up the booth.

**Typing a code is a first-class route, not a fallback in a menu.** Phones go
flat and screens crack, and a guard cannot be left unable to work because a
camera would not focus. There is an on-screen keypad rather than the system
keyboard, because it is always exactly six digits and the targets can be far
bigger that way.

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
- **Sign-in accepts any password.** It has to, until there is an API.
