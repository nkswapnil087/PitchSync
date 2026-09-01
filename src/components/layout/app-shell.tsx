"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { getRole } from "@/config/roles";
import { useAuth } from "@/features/auth";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopBar } from "./top-bar";
import { MainContent } from "./main-content";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const { role: roleId } = useAuth();
  const role = getRole(roleId);
  if (!role) return null;
  const style = { "--primary": role.accent, "--primary-hover": role.accentHover, "--primary-soft": role.accentSoft } as React.CSSProperties;
  return (
    <div style={style} className="min-h-screen overflow-x-hidden">
      <Sidebar role={role} open={navigationOpen} onClose={() => setNavigationOpen(false)} />
      <div className="min-h-screen lg:pl-[248px]">
        <TopBar onOpenNavigation={() => setNavigationOpen(true)} />
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          <MainContent>{children}</MainContent>
        </motion.div>
      </div>
    </div>
  );
}
