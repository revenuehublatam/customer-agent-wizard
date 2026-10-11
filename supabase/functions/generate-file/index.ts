// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";
import { callAnthropic, substitutePlaceholders } from "../_shared/anthropic.ts";

const DIACRITICS = /[̀-ͯ]/g;

function slugify(s: string): string {
  return (s || "cliente")
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fillFilename(pattern: string, slug: string): string {
  return pattern.replace(/\{\{cliente_slug\}\}/g, slug);
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

    const { session_id, prompt_template_id } = await req.json();
    if (!session_id || !prompt_template_id) {
      throw new Error("session_id and prompt_template_id required");
    }

    const { data: session, error: sErr } = await supabase
      .from("hubspot_agent_wizard_sessions")
      .select("id, client_id, team_id, form_data, blueprint")
      .eq("id", session_id)
      .single();
    if (sErr || !session) throw new Error("session not found");

    const { data: client } = await supabase
      .from("hubspot_agent_clients")
      .select("name, industry, website_url, primary_product, channels, notion_id")
      .eq("id", session.client_id)
      .single();

    const { data: tpl, error: tErr } = await supabase
      .from("hubspot_agent_prompt_templates")
      .select("id, content, output_format, filename_pattern")
      .eq("id", prompt_template_id)
      .single();
    if (tErr || !tpl) throw new Error("template not found");

    const slug = slugify(client?.name ?? "cliente");
    const filename = fillFilename(
      tpl.filename_pattern ?? `${tpl.id}-${slug}.${tpl.output_format}`,
      slug,
    );

    const f = (session.form_data ?? {}) as Record<string, unknown>;
    const placeholders: Record<string, unknown> = {
      cliente: client?.name ?? "",
      cliente_slug: slug,
      industry: client?.industry ?? "",
      product: client?.primary_product ?? "",
      website_url: client?.website_url ?? "",
      channels: client?.channels ?? [],
      notion_id: client?.notion_id ?? "",
      blueprint_json: session.blueprint ?? {},
      restrictions: f.restrictions ?? {},
      escalation_amount: (f.restrictions as any)?.escalation_amount ?? "",
      personality_preset: f.personality_preset ?? "",
      icp_summary: f.icp_summary ?? "",
      teams: f.teams ?? [],
      hubspot_products: f.hubspot_products ?? [],
      fecha: new Date().toISOString().slice(0, 10),
    };

    const prompt = substitutePlaceholders(tpl.content, placeholders);
    const start = Date.now();

    const response = await callAnthropic(
      [{ role: "user", content: prompt }],
      {
        max_tokens: 16000,
        temperature: 0.3,
      },
    );

    const output = response.text;
    const storagePath = `team_${session.team_id}/client_${session.client_id}/session_${session_id}/${filename}`;

    const mimeType = tpl.output_format === "csv" ? "text/csv" : "text/markdown";

    const { error: upErr } = await supabase.storage
      .from("generated-files")
      .upload(storagePath, new Blob([output], { type: mimeType }), {
        upsert: true,
        contentType: mimeType,
      });
    if (upErr) throw new Error(`storage: ${upErr.message}`);

    const preview = output.slice(0, 800);

    const { data: fileRow, error: fErr } = await supabase
      .from("hubspot_agent_generated_files")
      .upsert(
        {
          session_id,
          team_id: session.team_id,
          prompt_template_id,
          filename,
          output_format: tpl.output_format,
          storage_path: storagePath,
          preview,
          status: "ready",
        },
        { onConflict: "session_id,prompt_template_id" },
      )
      .select()
      .single();

    if (fErr) {
      const { data: inserted } = await supabase
        .from("hubspot_agent_generated_files")
        .insert({
          session_id,
          team_id: session.team_id,
          prompt_template_id,
          filename,
          output_format: tpl.output_format,
          storage_path: storagePath,
          preview,
          status: "ready",
        })
        .select()
        .single();
      if (!inserted) throw new Error(fErr.message);
    }

    await supabase.from("hubspot_agent_generation_logs").insert({
      session_id,
      team_id: session.team_id,
      prompt_template_id,
      model: "claude-opus-4-7",
      input_tokens: response.input_tokens,
      output_tokens: response.output_tokens,
      duration_ms: Date.now() - start,
      status: "success",
    });

    return new Response(
      JSON.stringify({
        file_id: fileRow?.id,
        storage_path: storagePath,
        preview,
      }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" },
      },
    );
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
