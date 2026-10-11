// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";

interface Check {
  check_type: string;
  status: "pass" | "fail" | "warning";
  details: Record<string, unknown>;
}

async function hsGet(token: string, path: string): Promise<any> {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });
  if (!res.ok) {
    return { __error: res.status, body: await res.text() };
  }
  return await res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { client_id } = await req.json();
    if (!client_id) throw new Error("client_id required");

    const { data: client, error: cErr } = await supabase
      .from("hubspot_agent_clients")
      .select("id, team_id, hubspot_oauth_token, hubspot_portal_id")
      .eq("id", client_id)
      .single();
    if (cErr || !client) throw new Error("client not found");

    const token = client.hubspot_oauth_token;
    const checks: Check[] = [];

    if (!token) {
      checks.push({
        check_type: "oauth",
        status: "fail",
        details: { message: "HubSpot no conectado" },
      });
    } else {
      const kb = await hsGet(token, "/cms/v3/knowledge-base/articles?limit=1");
      checks.push({
        check_type: "knowledge_base",
        status: kb.__error ? "fail" : kb.total > 0 ? "pass" : "warning",
        details: { total: kb.total ?? 0, error: kb.__error ?? null },
      });

      const products = await hsGet(token, "/crm/v3/objects/products?limit=1");
      checks.push({
        check_type: "products",
        status: products.__error
          ? "fail"
          : (products.results?.length ?? 0) > 0
            ? "pass"
            : "warning",
        details: { sample_count: products.results?.length ?? 0 },
      });

      const inboxes = await hsGet(
        token,
        "/conversations/v3/conversations/inboxes",
      );
      checks.push({
        check_type: "inboxes",
        status: inboxes.__error ? "fail" : "pass",
        details: { count: inboxes.results?.length ?? 0 },
      });
    }

    await supabase
      .from("hubspot_agent_validation_checks")
      .delete()
      .eq("client_id", client_id);

    const rows = checks.map((c) => ({
      client_id,
      team_id: client.team_id,
      check_type: c.check_type,
      status: c.status,
      details: c.details,
    }));

    if (rows.length > 0) {
      await supabase.from("hubspot_agent_validation_checks").insert(rows);
    }

    return new Response(JSON.stringify({ checks }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      },
    );
  }
});
