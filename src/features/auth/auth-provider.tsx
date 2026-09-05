"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AuthSession, RoleId } from "./types";

type SignInResult = { ok: true; session: AuthSession } | { ok: false; error: string };
type AuthContextValue = {
  session: AuthSession | null;
  signedIn: boolean;
  role: RoleId | null;
  hydrated: boolean;
signIn: (
  identifier: string,
  password: string,
) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const sessionBootstrap = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    sessionBootstrap.current = controller;

    fetch("/api/auth/session", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json() as { data?: AuthSession };
        if (controller.signal.aborted) return;
        setSession(response.ok ? body.data ?? null : null);
        setHydrated(true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSession(null);
        setHydrated(true);
      });

    return () => {
      controller.abort();
      if (sessionBootstrap.current === controller) {
        sessionBootstrap.current = null;
      }
    };
  }, []);

  const signIn = useCallback(
    async (
      identifier: string,
      password: string,
    ): Promise<SignInResult> => {
      sessionBootstrap.current?.abort();
      sessionBootstrap.current = null;
      setHydrated(true);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            identifier,
            password,
          }),
        });

        const body = await response.json().catch(() => ({})) as {
          data?: AuthSession;
          error?: string;
        };

        if (!response.ok || !body.data) {
          return {
            ok: false,
            error: body.error ?? "Unable to sign in.",
          };
        }

        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const sessionBody = await sessionResponse.json().catch(() => ({})) as {
          data?: AuthSession;
        };

        if (!sessionResponse.ok || !sessionBody.data) {
          setSession(null);
          return {
            ok: false,
            error: "Your credentials were accepted, but the sign-in session could not be saved. Make sure cookies are enabled, then try again.",
          };
        }

        setSession(sessionBody.data);

        return {
          ok: true,
          session: sessionBody.data,
        };
      } catch {
        return {
          ok: false,
          error: "Unable to reach the sign-in service. Check your connection and try again.",
        };
      }
    },
    [],
  );

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
