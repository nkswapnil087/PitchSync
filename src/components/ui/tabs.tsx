"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) { return <TabsPrimitive.List className={cn("flex w-full gap-1 overflow-x-auto border-b", className)} {...props} />; }
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) { return <TabsPrimitive.Trigger className={cn("shrink-0 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-[var(--text-muted)] outline-none transition hover:text-[var(--text)] data-[state=active]:border-[var(--primary)] data-[state=active]:text-[var(--primary)]", className)} {...props} />; }
export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) { return <TabsPrimitive.Content className={cn("mt-5 outline-none", className)} {...props} />; }
