/**
 * Access codes, and the check in / check out state of each pass.
 *
 * Local seed data standing in for the API, behind async functions so wiring
 * real endpoints later means changing this file and nothing else.
 *
 * A guard sees a name, the pass, and whether it has been used. That is all: no
 * contact details, no payment status, no other property. The shape of `Pass` is
 * the access boundary, so widening it is a decision rather than an accident.
 */

export type PassKind = "Resident" | "Guest";
/** Whether the pass covers coming in and going out, or entry only. */
export type PassDirection = "Two-way" | "One-way";

export interface Pass {
  /** Six digits, stored unformatted. */
  code: string;
  name: string;
  kind: PassKind;
  direction: PassDirection;
  unit: string;
  createdAt: string;
  expiresAt: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  /** Set when the resident cancelled it, or it has passed its expiry. */
  invalidReason?: string;
}

let passes: Pass[] = [
  {
    code: "482212",
    name: "Emeka Adinuke",
    kind: "Guest",
    direction: "Two-way",
    unit: "House 5A, Road 3",
    createdAt: "Created today 02:30 PM",
    expiresAt: "Expires tonight at 08:00 PM",
    checkedInAt: null,
    checkedOutAt: null,
  },
  {
    code: "482913",
    name: "Chisom Okafor",
    kind: "Resident",
    direction: "Two-way",
    unit: "House 5A, Road 3",
    createdAt: "Resident code",
    expiresAt: "Does not expire",
    checkedInAt: null,
    checkedOutAt: null,
  },
  {
    code: "118342",
    name: "Daniel Umeh",
    kind: "Guest",
    direction: "One-way",
    unit: "House 12, Road 7",
    createdAt: "Created today 09:15 AM",
    expiresAt: "Expires tonight at 11:59 PM",
    checkedInAt: "10:02 AM",
    checkedOutAt: null,
  },
  {
    code: "660271",
    name: "Grace Ibe",
    kind: "Guest",
    direction: "Two-way",
    unit: "Flat 2B, Block C",
    createdAt: "Created yesterday 04:00 PM",
    expiresAt: "Expired yesterday at 11:59 PM",
    checkedInAt: null,
    checkedOutAt: null,
    invalidReason: "This pass has expired. Ask the resident to send a new one.",
  },
  {
    code: "904417",
    name: "Tunde Bello",
    kind: "Guest",
    direction: "One-way",
    unit: "Flat 2B, Block C",
    createdAt: "Created today 11:20 AM",
    expiresAt: "Cancelled",
    checkedInAt: null,
    checkedOutAt: null,
    invalidReason: "This pass was cancelled by the resident.",
  },
];

const listeners = new Set<() => void>();

function computeUsed() {
  return passes.filter((p) => p.checkedInAt || p.checkedOutAt);
}

/**
 * Cached so the reference only changes when the data does. `useSyncExternalStore`
 * compares snapshots by identity, so returning a freshly filtered array on every
 * call makes it re-render forever.
 */
let usedCache: Pass[] = computeUsed();

function emit() {
  usedCache = computeUsed();
  for (const listener of listeners) listener();
}

export function subscribeToPasses(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** A scanned QR may carry a URL or a prefix; a typed code will not. */
export function normaliseCode(raw: string) {
  const match = raw.replace(/\D/g, "").match(/\d{6}/);
  return match ? match[0] : raw.replace(/\D/g, "");
}

/** `482212` reads as `482 - 212`, which is how the design shows it. */
export function formatCode(code: string) {
  return code.length === 6 ? `${code.slice(0, 3)} - ${code.slice(3)}` : code;
}

export type LookupResult = { ok: true; pass: Pass } | { ok: false; message: string };

export async function lookupCode(raw: string): Promise<LookupResult> {
  const code = normaliseCode(raw);
  // Stands in for the round trip, so the UI is built against a real pending state.
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (code.length !== 6) return { ok: false, message: "Wrong code please try again" };

  const pass = passes.find((p) => p.code === code);
  if (!pass) return { ok: false, message: "Wrong code please try again" };
  if (pass.invalidReason) return { ok: false, message: pass.invalidReason };

  return { ok: true, pass };
}

export function getPass(code: string) {
  return passes.find((p) => p.code === normaliseCode(code)) ?? null;
}

function stamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function checkIn(code: string) {
  passes = passes.map((p) => (p.code === code ? { ...p, checkedInAt: stamp() } : p));
  emit();
}

export function checkOut(code: string) {
  passes = passes.map((p) => (p.code === code ? { ...p, checkedOutAt: stamp() } : p));
  emit();
}

/** Passes touched on this shift, for the account screen. */
export function usedPasses() {
  return usedCache;
}
