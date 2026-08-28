"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function SidebarNavigation({ items, onNavigate }: { items: readonly NavigationItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Primary navigation"><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Workspace</p><ul className="space-y-1">{items.map((item) => { const Icon = item.icon; const active = item.href ? pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)) : false; const content = <span className={cn("flex h-10 w-full items-center gap-3 rounded-[9px] px-3 text-sm font-medium transition-colors", item.disabled ? "cursor-not-allowed text-white/30" : active ? "bg-white/12 text-white shadow-[inset_3px_0_var(--bd-red)]" : "text-white/67 hover:bg-white/7 hover:text-white")}><Icon className="size-[18px] shrink-0" /><span className="min-w-0 flex-1 truncate text-left">{item.label}</span></span>;
    return <li key={item.label}>{item.disabled ? <div aria-disabled="true">{content}</div> : <Link href={item.href ?? "/"} onClick={onNavigate}>{content}</Link>}</li>;
  })}</ul></nav>;
}

export const SidebarNav = SidebarNavigation;
