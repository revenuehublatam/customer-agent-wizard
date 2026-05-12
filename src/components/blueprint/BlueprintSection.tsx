import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlueprintSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function BlueprintSection({
  title,
  description,
  defaultOpen = false,
  children,
}: BlueprintSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">{title}</span>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
        <span className="text-muted-foreground">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
      </button>
      <div
        className={cn(
          "border-t border-border bg-muted/30 px-4 py-4",
          !open && "hidden",
        )}
      >
        {children}
      </div>
    </div>
  );
}
