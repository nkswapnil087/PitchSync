"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthSession, RoleId } from "./types";

type SignInResult = { ok: true; session: AuthSession } | { ok: false; error: string };
type AuthContextValue = {
  session: AuthSession | null;
  signedIn: boolean;
  role: RoleId | null;
  hydrated: boolean;
  signIn: (identifier: string, password: string, role: RoleId) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json() as { data?: AuthSession };
        setSession(response.ok ? body.data ?? null : null);
        setHydrated(true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSession(null);
        setHydrated(true);
      });
    return () => controller.abort();
  }, []);

  const signIn = useCallback(async (identifier: string, password: string, role: RoleId): Promise<SignInResult> => {
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password, role }) });
    const body = await response.json() as { data?: AuthSession; error?: string };
    if (!response.ok || !body.data) return { ok: false, error: body.error ?? "Unable to sign in." };
    setSession(body.data);
    setHydrated(true);
    return { ok: true, session: body.data };
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setSession(null);
    setHydrated(true);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ session, signedIn: Boolean(session), role: session?.role ?? null, hydrated, signIn, signOut }), [session, hydrated, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
