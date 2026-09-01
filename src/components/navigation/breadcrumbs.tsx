"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { routeLabels } from "@/config/navigation";
import { canAnyRoleAccess } from "@/config/route-access";
import { getRole } from "@/config/roles";
import { useAuth } from "@/features/auth";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { role } = useAuth();
  const dashboard = getRole(role)?.dashboardRoute ?? "/sign-in";
  const segments = pathname.split("/").filter(Boolean);
  return <nav aria-label="Breadcrumb" className="min-w-0 overflow-hidden"><ol className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-xs text-[var(--text-muted)]"><li className="shrink-0"><Link href={dashboard} className="hover:text-[var(--primary)]" aria-label="Dashboard"><Home className="size-3.5" /></Link></li>{segments.map((segment, index) => { const last = index === segments.length - 1; const label = routeLabels[segment] ?? (last && segments.length > 1 ? "Record" : segment.replaceAll("-", " ")); const href = `/${segments.slice(0, index + 1).join("/")}`; const linked = !last && canAnyRoleAccess(href); return <li key={href} className="flex min-w-0 items-center gap-1.5"><ChevronRight className="size-3 shrink-0" />{last ? <span className="truncate font-medium text-[var(--text)]">{label}</span> : linked ? <Link href={href} className="truncate capitalize hover:text-[var(--primary)]">{label}</Link> : <span className="truncate capitalize">{label}</span>}</li>; })}</ol></nav>;
}
