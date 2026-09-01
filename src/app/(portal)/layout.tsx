import { AppShell } from "@/components/layout/app-shell";
import { RouteGuard } from "@/features/auth";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard><AppShell>{children}</AppShell></RouteGuard>;
}
