import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWizardStore } from "@/store/wizardStore";
import type { Blueprint, WizardFormData } from "@/lib/types";

interface UseWizardSessionResult {
  loading: boolean;
  error: string | null;
  clientName: string;
}

export function useWizardSession(clientId: string | undefined): UseWizardSessionResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string>("");
  const setSession = useWizardStore((s) => s.setSession);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const { data: client, error: cErr } = await supabase
          .from("hubspot_agent_clients")
          .select("id, name, team_id")
          .eq("id", clientId)
          .single();
        if (cErr || !client) throw new Error(cErr?.message ?? "client not found");
        if (cancelled) return;
        setClientName(client.name);

        const { data: existing } = await supabase
          .from("hubspot_agent_wizard_sessions")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let session = existing;
        if (!session) {
          const { data: created, error: insErr } = await supabase
            .from("hubspot_agent_wizard_sessions")
            .insert({
              client_id: clientId,
              team_id: client.team_id,
              current_step: 1,
              form_data: {},
            })
            .select()
            .single();
          if (insErr) throw insErr;
          session = created;
        }

        if (cancelled || !session) return;

        setSession(
          session.id,
          clientId,
          session.current_step ?? 1,
          (session.form_data ?? {}) as WizardFormData,
          (session.blueprint ?? null) as Blueprint | null,
          session.blueprint_approved ?? false,
        );
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, setSession]);

  return { loading, error, clientName };
}
