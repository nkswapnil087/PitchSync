import type { RoleDefinition } from "@/config/roles";
import { navigationByRole } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNavigation } from "./sidebar-navigation";

export function Sidebar({ role, open, onClose }: { role: RoleDefinition; open: boolean; onClose: () => void }) {
  return <><button type="button" aria-label="Close navigation" onClick={onClose} className={cn("fixed inset-0 z-30 bg-black/35 transition-opacity lg:hidden", open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")} /><aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-[linear-gradient(180deg,var(--bd-green-deep),var(--bd-green-darker))] text-[var(--sidebar-text)] shadow-2xl transition-transform lg:z-30 lg:translate-x-0 lg:shadow-none", open ? "translate-x-0" : "-translate-x-full")}><SidebarHeader subtitle={role.shortLabel} onClose={onClose} /><SidebarNavigation items={navigationByRole[role.id]} onNavigate={onClose} /><SidebarFooter /></aside></>;
}
