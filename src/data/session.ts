import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * The signed-in estate.
 *
 * There are no personal guard accounts. Each estate has one gate account,
 * created for it by Ndurva, and every guard on duty at that gate signs in with
 * it. The property comes from the account rather than being chosen in the app,
 * so a gate phone can only ever verify codes for the estate it belongs to, and
 * there is no UI here that could let it try another.
 */

// Renamed from the personal-account key, so a phone still signed in as an
// individual guard from before is signed out rather than carried over.
const STORAGE_KEY = "ndurva_security_estate_session";

export interface EstateSession {
  /** The estate this gate account belongs to, and the only one it works for. */
  property: string;
  /** The gate account's login, shared by everyone on duty there. */
  email: string;
  token: string;
}

export interface SessionState {
  session: EstateSession | null;
  /** Distinguishes "signed out" from "not read from storage yet". */
  loading: boolean;
}

/** Placeholder for the real endpoint. Any password is accepted for now. */
export async function signIn(email: string, password: string): Promise<EstateSession> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (!email.trim() || !password) throw new Error("Enter the estate's email and password.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error("That email address does not look right.");

  const session: EstateSession = {
    email: email.trim().toLowerCase(),
    property: "Winter Estate",
    token: "dev-token",
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function signOut() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function readSession(): Promise<EstateSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const session = raw ? (JSON.parse(raw) as Partial<EstateSession>) : null;
    return session?.property && session.email && session.token ? (session as EstateSession) : null;
  } catch {
    // A corrupt or unreadable session is the same as no session.
    return null;
  }
}

export function useSession() {
  const [state, setState] = useState<SessionState>({ session: null, loading: true });

  const refresh = useCallback(async () => {
    const session = await readSession();
    setState({ session, loading: false });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
