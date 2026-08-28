import { PitchSyncMark } from "@/components/branding/pitchsync-mark";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function SidebarHeader({ subtitle, onClose }: { subtitle: string; onClose: () => void }) {
  return <div className="flex h-24 items-center justify-between border-b border-white/10 px-5"><PitchSyncMark compact dark subtitle={subtitle} /><Button type="button" variant="ghost" size="icon" className="text-white/70 hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose} aria-label="Close navigation"><X /></Button></div>;
}
