import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import { supabaseConfigured } from "./lib/supabase";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MissingEnvScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-xl rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm">
        <h1 className="mb-2 text-lg font-semibold text-destructive">
          Faltan variables de entorno de Supabase
        </h1>
        <p className="mb-3 text-muted-foreground">
          Crea un archivo <code className="font-mono">.env</code> en la raíz del
          proyecto con las siguientes variables y reinicia{" "}
          <code className="font-mono">npm run dev</code>:
        </p>
        <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
{`VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>`}
        </pre>
        <p className="mt-3 text-xs text-muted-foreground">
          Encuentra estos valores en el dashboard de Supabase:{" "}
          <em>Settings → API</em>.
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {supabaseConfigured ? (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    ) : (
      <MissingEnvScreen />
    )}
  </React.StrictMode>,
);
