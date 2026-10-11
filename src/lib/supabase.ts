import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  console.error(
    "[Supabase] Faltan variables de entorno. Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (ver .env.example).",
  );
}

// Fallback inocuo para que el bundle no explote si faltan envs.
// El error real se muestra en pantalla desde main.tsx.
const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "placeholder-anon-key";

export const supabase: SupabaseClient = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
