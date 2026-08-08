import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readSession, signIn as apiSignIn, signOut as apiSignOut, type GuardSession } from "@/data/session";

interface SessionContextValue {
  session: GuardSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/** One source of truth for the session, so the router and screens cannot disagree. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<GuardSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void readSession().then((stored) => {
      setSession(stored);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setSession(await apiSignIn(email, password));
  }, []);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setSession(null);
  }, []);

  const value = useMemo(() => ({ session, loading, signIn, signOut }), [session, loading, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSessionContext must be used inside SessionProvider");
  return value;
}
