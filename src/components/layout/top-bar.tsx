"use client";

import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { RoleBadge } from "@/components/data-display/role-badge";
import { Button } from "@/components/ui/button";
import { useDemoAuth } from "@/features/demo-auth";
import { Menu } from "lucide-react";

export function TopBar({ onOpenNavigation }: { onOpenNavigation: () => void }) {
  const { role } = useDemoAuth();
  if (!role) return null;
  return <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[var(--border)] bg-[rgba(251,248,240,.94)] px-4 backdrop-blur sm:px-5 lg:px-7"><div className="flex min-w-0 items-center gap-2"><Button type="button" variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onOpenNavigation} aria-label="Open navigation"><Menu /></Button><Breadcrumbs /></div><div className="hidden shrink-0 sm:block"><RoleBadge roleId={role} /></div></header>;
}
