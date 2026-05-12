import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between px-8">
        <Logo />
        <Link to="/login">
          <Button variant="outline" size="sm">
            Iniciar sesión
          </Button>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="flex max-w-2xl flex-col items-center text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Configura tu Customer Agent en 1 día
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Un wizard de 8 pasos para producir el blueprint completo y los
            archivos listos para cargar en HubSpot. Sin improvisar, sin huecos.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link to="/login">
              <Button variant="primary" size="lg">
                Empezar
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-border px-8 py-4 text-xs text-muted-foreground">
        Revenue Hub Latam
      </footer>
    </div>
  );
}
