"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger className={cn("flex h-10 w-full min-w-36 items-center justify-between gap-3 rounded-[10px] border bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--bd-green)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--bd-green)_16%,transparent)] data-[placeholder]:text-[var(--text-muted)] sm:w-auto", className)} {...props}>{children}<SelectPrimitive.Icon><ChevronDown className="size-4 text-[var(--text-muted)]" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}

export function SelectContent({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content position="popper" sideOffset={5} className={cn("z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[10px] border bg-[var(--surface-elevated)] p-1 shadow-lg", className)} {...props}><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>;
}

export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item className={cn("relative flex cursor-default select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm outline-none focus:bg-[var(--surface-muted)]", className)} {...props}><span className="absolute left-2"><SelectPrimitive.ItemIndicator><Check className="size-4 text-[var(--primary)]" /></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>;
}
