import { Button } from "@/components/ui/button";

interface StepLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: React.ReactNode;
}

export function StepLayout({
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel = "Siguiente",
  nextDisabled,
  children,
}: StepLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-8 py-10">
      <header className="flex flex-col gap-1">
        <h1>{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </header>
      <section className="flex flex-col gap-6">{children}</section>
      <footer className="flex items-center justify-between border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={!onBack}
        >
          Atrás
        </Button>
        {onNext && (
          <Button type="button" onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
          </Button>
        )}
      </footer>
    </div>
  );
}
