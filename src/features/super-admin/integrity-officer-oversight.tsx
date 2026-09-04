"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page/page-header";
import type { IntegrityOfficerListItem } from "@/data/contracts";
import type { IntegrityScope } from "@/features/auth/types";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";

const columns = ["Officer", "ID", "Email", "Department", "Account status", "Responsibility"] as const;

function ResponsibilitySelect({
  officer,
}: {
  officer: IntegrityOfficerListItem;
}) {
  const [value, setValue] = useState<IntegrityScope | null>(
    officer.accessScope,
  );
  const [pending, setPending] = useState(false);

  const update = async (next: IntegrityScope) => {
    if (next === value) return;

    setPending(true);

    try {
      const response = await fetch(
        `/api/super-admin/integrity-officers/${encodeURIComponent(officer.adminId)}/scope`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scope: next }),
        },
      );

      const body = await response.json() as { error?: string };

      if (!response.ok) {
        toast.error(body.error ?? "Unable to update responsibility.");
        return;
      }

      setValue(next);
      toast.success("Integrity responsibility updated.");
    } catch {
      toast.error("Unable to update responsibility.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Select
      value={value ?? ""}
      onValueChange={(selected) => update(selected as IntegrityScope)}
      disabled={pending}
    >
      <SelectTrigger
        aria-label={`Responsibility for ${officer.fullName}`}
        className="w-full min-w-44"
        disabled={pending}
      >
        <SelectValue placeholder="Not assigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="MANAGER">Manager</SelectItem>
        <SelectItem value="INVESTIGATOR">Investigator</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function IntegrityOfficerOversight() {
  const { state } = useRegistryFilters<IntegrityOfficerListItem>(
    "No Integrity Officers are currently registered.",
    "/api/super-admin/integrity-officers",
  );

  return (
    <>
      <PageHeader
        eyebrow="System administration"
        title="Integrity Officers"
        description="Review active Integrity & Compliance Officers and assign each person's current management responsibility."
      />
      <RegistryTable
        columns={columns}
        state={state}
        emptyTitle="No Integrity Officers found"
        emptyDescription="No active Integrity & Compliance Officers are registered."
        renderRow={(officer) => ({
          key: officer.adminId,
          cells: [
            <span key="name" className="font-semibold">{officer.fullName}</span>,
            officer.adminId,
            officer.email,
            officer.department,
            officer.accountStatus ? (
              <Badge key="status" variant="default">{officer.accountStatus}</Badge>
            ) : (
              <span key="status" className="text-[var(--text-muted)]">—</span>
            ),
            <ResponsibilitySelect key="scope" officer={officer} />,
          ],
        })}
      />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <ShieldCheck className="size-4" />
        Only a Super Administrator can change an Integrity Officer&apos;s responsibility.
      </p>
    </>
  );
}
