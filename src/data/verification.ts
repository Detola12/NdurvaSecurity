/**
 * Code verification, and the log of what came through the gate.
 *
 * Everything here is local seed data standing in for the API. It is kept in one
 * place with a deliberately async surface, so swapping in real endpoints later
 * means changing this file and nothing else.
 *
 * A guard sees whether a code is valid and who it belongs to. That is all. No
 * tenant contact details, no payment status, no other property. The shape of
 * these types is the access boundary, so widening them is a decision, not an
 * accident.
 */

export type CodeKind = "Resident" | "Visitor";
export type Direction = "Entry" | "Exit";

export interface VerifiedPass {
  outcome: "allowed";
  kind: CodeKind;
  /** Who is at the gate. For a visitor, the guest's name. */
  name: string;
  unit: string;
  /** Only set for a visitor pass: the resident expecting them. */
  host?: string;
  /** Only set for a resident code: how many people the code covers. */
  members?: number;
  validUntil?: string;
  code: string;
}

export interface RejectedPass {
  outcome: "denied";
  code: string;
  /** Plain language, because it gets read aloud to whoever is at the gate. */
  reason: string;
}

export type VerificationResult = VerifiedPass | RejectedPass;

export interface GateEvent {
  id: string;
  name: string;
  unit: string;
  kind: CodeKind;
  direction: Direction;
  /** ISO timestamp, formatted at the point of display. */
  at: string;
}

interface SeedPass {
  code: string;
  kind: CodeKind;
  name: string;
  unit: string;
  host?: string;
  members?: number;
  validUntil?: string;
  /** Expired and revoked passes both exist, and must read differently. */
  status: "active" | "expired" | "revoked";
}

/** Codes issued for the property this guard is posted to. */
const passes: SeedPass[] = [
  { code: "482913", kind: "Resident", name: "Chisom Okafor", unit: "House 5A, Road 3", members: 4, status: "active" },
  { code: "729140", kind: "Resident", name: "Abiodun Adeleke", unit: "House 12, Road 7", members: 3, status: "active" },
  { code: "305518", kind: "Resident", name: "Ngozi Eze", unit: "Flat 2B, Block C", members: 2, status: "active" },
  {
    code: "118342",
    kind: "Visitor",
    name: "Daniel Umeh",
    unit: "House 5A, Road 3",
    host: "Chisom Okafor",
    validUntil: "Today, 11:59 PM",
    status: "active",
  },
  {
    code: "660271",
    kind: "Visitor",
    name: "Grace Ibe",
    unit: "House 12, Road 7",
    host: "Abiodun Adeleke",
    validUntil: "Yesterday, 11:59 PM",
    status: "expired",
  },
  {
    code: "904417",
    kind: "Visitor",
    name: "Tunde Bello",
    unit: "Flat 2B, Block C",
    host: "Ngozi Eze",
    status: "revoked",
  },
];

const denialReason: Record<Exclude<SeedPass["status"], "active">, string> = {
  expired: "This pass has expired. Ask the resident to issue a new one.",
  revoked: "This pass was cancelled by the resident.",
};

let log: GateEvent[] = [
  { id: "g-1", name: "Chisom Okafor", unit: "House 5A, Road 3", kind: "Resident", direction: "Entry", at: isoAgo(35) },
  { id: "g-2", name: "Daniel Umeh", unit: "House 5A, Road 3", kind: "Visitor", direction: "Entry", at: isoAgo(74) },
  { id: "g-3", name: "Ngozi Eze", unit: "Flat 2B, Block C", kind: "Resident", direction: "Exit", at: isoAgo(126) },
  { id: "g-4", name: "Abiodun Adeleke", unit: "House 12, Road 7", kind: "Resident", direction: "Entry", at: isoAgo(190) },
];

function isoAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

/** A scanned QR may carry a URL or a prefixed payload; a typed code will not. */
export function normaliseCode(raw: string) {
  const digits = raw.trim().match(/(\d{6})(?!.*\d{6})/);
  return digits ? digits[1] : raw.trim().toUpperCase();
}

export async function verifyCode(raw: string): Promise<VerificationResult> {
  const code = normaliseCode(raw);
  // Stands in for the round trip, so the UI is built against a real pending state.
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (!/^\d{6}$/.test(code)) {
    return { outcome: "denied", code, reason: "That is not a valid Ndurva code. Codes are six digits." };
  }

  const pass = passes.find((p) => p.code === code);
  if (!pass) {
    return { outcome: "denied", code, reason: "No pass found for this code at this property." };
  }
  if (pass.status !== "active") {
    return { outcome: "denied", code, reason: denialReason[pass.status] };
  }

  return {
    outcome: "allowed",
    kind: pass.kind,
    name: pass.name,
    unit: pass.unit,
    host: pass.host,
    members: pass.members,
    validUntil: pass.validUntil,
    code: pass.code,
  };
}

const listeners = new Set<() => void>();

export function subscribeToLog(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLog() {
  return log;
}

/** Records a movement. Called only after a guard confirms which way they went. */
export function recordMovement(pass: VerifiedPass, direction: Direction) {
  const event: GateEvent = {
    id: `g-${Date.now()}`,
    name: pass.name,
    unit: pass.unit,
    kind: pass.kind,
    direction,
    at: new Date().toISOString(),
  };
  log = [event, ...log];
  for (const listener of listeners) listener();
  return event;
}

export function todayTotals(events: GateEvent[] = log) {
  const today = new Date().toDateString();
  const onToday = events.filter((e) => new Date(e.at).toDateString() === today);
  const entries = onToday.filter((e) => e.direction === "Entry").length;
  const exits = onToday.filter((e) => e.direction === "Exit").length;
  return { entries, exits, inside: Math.max(0, entries - exits) };
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
