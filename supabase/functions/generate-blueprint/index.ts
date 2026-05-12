// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";
import { callAnthropic, substitutePlaceholders } from "../_shared/anthropic.ts";

const BlueprintSchema = z.object({
  persona: z.object({
    name: z.string(),
    personality: z.enum([
      "Professional",
      "Friendly",
      "Casual",
      "Empathetic",
      "Witty",
    ]),
    language_primary: z.string(),
    languages_secondary: z.array(z.string()),
    identity: z.enum(["bot", "team_member"]),
  }),
  top_topics: z.array(
    z.object({
      topic: z.string(),
      volume_estimated: z.enum(["high", "med", "low"]),
      complexity: z.number(),
      risk_if_fail: z.enum(["high", "med", "low"]),
      canonical_answer: z.string(),
      source: z.string(),
    }),
  ),
  escalation_rules: z.object({
    auto_triggers: z.array(z.string()),
    routing: z.record(z.string()),
    sla_by_channel: z.record(z.string()),
    never_attempt: z.array(z.string()),
  }),
  lead_qualification: z.object({
    applies: z.boolean(),
    questions: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        branches: z.record(z.string()),
      }),
    ),
    criteria: z.object({
      MQL: z.array(z.string()),
      SQL: z.array(z.string()),
      rejected: z.array(z.string()),
    }),
    final_action: z.object({
      MQL: z.string(),
      SQL: z.string(),
      rejected: z.string(),
    }),
  }),
  guardrails: z.object({
    forbidden_topics: z.array(z.string()),
    sensitive_info: z.array(z.string()),
    mandatory_disclaimers: z.array(z.string()),
  }),
  commercial_signals: z.object({
    buy_intent_phrases: z.array(z.string()),
    competitor_mentions: z.array(z.string()),
    upsell_triggers: z.array(z.string()),
  }),
  source_inventory: z.array(
    z.object({
      topic: z.string(),
      source_type: z.string(),
      status: z.enum(["EXISTS", "CREATE", "REFACTOR"]),
      action: z.string(),
      priority: z.enum(["P0", "P1", "P2"]),
      owner: z.enum(["client", "revenue_hub"]),
    }),
  ),
  short_answers: z.array(
    z.object({
      question_main: z.string(),
      variants: z.array(z.string()),
      answer_literal: z.string(),
      reason: z.string(),
    }),
  ),
  actions: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      triggers: z.array(z.string()),
      protection: z.enum(["None", "MatchEmail", "VerifyEmail"]),
      system: z.string(),
      requires_custom_dev: z.boolean(),
    }),
  ),
  creation_plan: z.array(
    z.object({
      filename: z.string(),
      prompt_template_id: z.string(),
      owner: z.enum(["client", "revenue_hub"]),
      estimated_hours: z.number(),
      data_source: z.string(),
    }),
  ),
  roadmap: z.object({
    phase_1: z.array(z.string()),
    phase_2: z.array(z.string()),
    phase_3: z.array(z.string()),
  }),
  citation_strategy: z.object({
    public_citable: z.array(z.string()),
    private_only: z.array(z.string()),
    must_not_appear: z.array(z.string()),
  }),
  executive_summary: z.string(),
  top_3_pre_launch_actions: z.array(z.string()),
  current_coverage_pct: z.number(),
  projected_coverage_pct_phase_1: z.number(),
});

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  return trimmed;
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

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id required");

    const { data: session, error: sErr } = await supabase
      .from("wizard_sessions")
      .select("id, client_id, team_id, form_data")
      .eq("id", session_id)
      .single();
    if (sErr || !session) throw new Error(sErr?.message ?? "session not found");

    const { data: client } = await supabase
      .from("clients")
      .select("name, industry, website_url, primary_product, channels, notion_id")
      .eq("id", session.client_id)
      .single();

    const { data: tpl, error: tErr } = await supabase
      .from("prompt_templates")
      .select("content")
      .eq("id", "master")
      .single();
    if (tErr || !tpl) throw new Error("master template not found");

    const f = (session.form_data ?? {}) as Record<string, unknown>;
    const placeholders: Record<string, unknown> = {
      client_name: client?.name ?? "",
      industry: client?.industry ?? "",
      channels: client?.channels ?? [],
      notion_id: client?.notion_id ?? "",
      website_url: client?.website_url ?? "",
      product: client?.primary_product ?? "",
      personality_preset: f.personality_preset ?? "",
      brand_voice_custom: f.brand_voice_custom ?? "",
      identity: f.identity ?? "bot",
      selected_domains: f.selected_domains ?? [],
      restrictions: f.restrictions ?? {},
      actions_list: f.actions_list ?? [],
    };

    const prompt = substitutePlaceholders(tpl.content, placeholders);
    const start = Date.now();

    const response = await callAnthropic(
      [{ role: "user", content: prompt }],
      {
        max_tokens: 16000,
        temperature: 0.2,
        system:
          "Devuelve exclusivamente un objeto JSON válido. Sin preámbulo. Sin markdown. Sin backticks.",
      },
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(response.text));
    } catch {
      throw new Error("modelo no devolvió JSON parseable");
    }

    const blueprint = BlueprintSchema.parse(parsed);

    await supabase
      .from("wizard_sessions")
      .update({ blueprint, current_step: 7 })
      .eq("id", session_id);

    await supabase.from("generation_logs").insert({
      session_id,
      team_id: session.team_id,
      prompt_template_id: "master",
      model: "claude-opus-4-7",
      input_tokens: response.input_tokens,
      output_tokens: response.output_tokens,
      duration_ms: Date.now() - start,
      status: "success",
    });

    return new Response(JSON.stringify({ blueprint }), {
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
