import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * The signed-in guard.
 *
 * A guard account belongs to exactly one property, and the property comes from
 * the session rather than being chosen in the app. That is the whole point of
 * the account model: a guard cannot verify codes for somewhere they are not
 * posted, and there is no UI here that could let them try.
 */

const STORAGE_KEY = "ndurva_security_session";

export interface GuardSession {
  name: string;
  email: string;
  /** The single property this account is posted to. */
  property: string;
  token: string;
}

export interface SessionState {
  session: GuardSession | null;
  /** Distinguishes "signed out" from "not read from storage yet". */
  loading: boolean;
}

/** Placeholder for the real endpoint. Any password is accepted for now. */
export async function signIn(email: string, password: string): Promise<GuardSession> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (!email.trim() || !password) throw new Error("Enter your email and password.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error("That email address does not look right.");

  const session: GuardSession = {
    name: "Musa Ibrahim",
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

export async function readSession(): Promise<GuardSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GuardSession) : null;
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
