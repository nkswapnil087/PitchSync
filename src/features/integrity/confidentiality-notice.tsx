import { LockKeyhole } from "lucide-react";

export function ConfidentialityNotice({ children = "Complaint and case information is restricted to authorized integrity personnel." }: { children?: React.ReactNode }) {
  return <div className="flex items-start gap-3 rounded-xl border border-[#eadfb8] bg-[#faf6e9] p-4"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#866d1e]" aria-hidden="true" /><div><p className="text-sm font-semibold text-[#6e5a1c]">Confidentiality notice</p><p className="mt-1 text-xs leading-5 text-[#7d6b35]">{children}</p></div></div>;
}
