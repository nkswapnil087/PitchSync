import { cn } from "@/lib/utils";

export function DetailGrid({ children, columns = 3 }: { children: React.ReactNode; columns?: 2 | 3 | 4 }) {
  return <dl className={cn("grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2", columns === 3 && "xl:grid-cols-3", columns === 4 && "lg:grid-cols-4")}>{children}</dl>;
}
