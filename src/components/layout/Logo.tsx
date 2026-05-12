import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-6 w-6 rounded-sm bg-primary" aria-hidden />
      <span className="text-sm font-semibold tracking-tight text-foreground">
        Revenue Hub
      </span>
    </div>
  );
}
