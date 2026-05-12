import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  clientName?: string;
  onExit?: () => void;
  children: React.ReactNode;
}

export function AppShell({ clientName, onExit, children }: AppShellProps) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Logo />
          </Link>
          {clientName && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-foreground">
                {clientName}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onExit) onExit();
              navigate("/dashboard");
            }}
          >
            Guardar y salir
          </Button>
        </div>
      </header>
      <main className="flex flex-1">{children}</main>
    </div>
  );
}
