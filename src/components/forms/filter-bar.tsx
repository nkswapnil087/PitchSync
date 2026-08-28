export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-stretch gap-3 rounded-xl border bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>;
}
