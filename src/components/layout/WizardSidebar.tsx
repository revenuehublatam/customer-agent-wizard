import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDef {
  id: number;
  title: string;
  subtitle?: string;
}

export const WIZARD_STEPS: StepDef[] = [
  { id: 1, title: "Identificación del cliente" },
  { id: 2, title: "Fuentes de datos" },
  { id: 3, title: "Tono y voz" },
  { id: 4, title: "Dominios" },
  { id: 5, title: "Restricciones" },
  { id: 6, title: "Actions" },
  { id: 7, title: "Blueprint" },
  { id: 8, title: "Generación de archivos" },
];

interface WizardSidebarProps {
  currentStep: number;
  completedSteps: number[];
  onSelect: (step: number) => void;
}

export function WizardSidebar({
  currentStep,
  completedSteps,
  onSelect,
}: WizardSidebarProps) {
  return (
    <aside className="w-72 shrink-0 border-r border-border bg-white">
      <nav className="flex flex-col gap-1 p-4">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pasos
        </div>
        {WIZARD_STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isDone = completedSteps.includes(step.id);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelect(step.id)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isDone
                    ? "border-primary bg-primary text-white"
                    : isActive
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
              </span>
              <span className="truncate">{step.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
