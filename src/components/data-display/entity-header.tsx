import { Badge } from "@/components/ui/badge";

export function EntityHeader({
  eyebrow,
  title,
  referenceLabel,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  referenceLabel: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="rounded-xl border bg-white p-5 sm:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{eyebrow}</p>
          <h1 className="heading-font mt-2 text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{referenceLabel}: <strong className="text-[var(--text)]">—</strong></p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="unavailable">No record loaded</Badge>
          {actions}
        </div>
      </div>
      {children ? <div className="mt-6 border-t pt-6">{children}</div> : null}
    </header>
  );
}
