"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingState } from "@/components/feedback/loading-state";
import { canAccessRoute } from "@/config/route-access";
import { getRole } from "@/config/roles";
import { useAuth } from "./auth-provider";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!auth.hydrated) return;
    if (!auth.signedIn || !auth.role) router.replace("/sign-in");
    else if (!canAccessRoute(auth.role, pathname)) router.replace(getRole(auth.role)?.dashboardRoute ?? "/sign-in");
  }, [auth.hydrated, auth.role, auth.signedIn, pathname, router]);
  if (!auth.hydrated || !auth.signedIn || !auth.role || !canAccessRoute(auth.role, pathname)) return <div className="grid min-h-screen place-items-center"><LoadingState title="Preparing workspace" /></div>;
  return children;
}
