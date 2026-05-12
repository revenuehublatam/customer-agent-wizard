import { z } from "zod";

export const personalityEnum = z.enum([
  "Professional",
  "Friendly",
  "Casual",
  "Empathetic",
  "Witty",
]);

export const protectionEnum = z.enum(["None", "MatchEmail", "VerifyEmail"]);

export const step1Schema = z.object({
  client_name: z.string().min(2, "Nombre demasiado corto"),
  industry: z.string().min(1, "Selecciona una industria"),
  website_url: z.string().url("URL inválida").or(z.literal("")),
  primary_product: z.string().min(2, "Indica el producto principal"),
  channels: z.array(z.string()).min(1, "Selecciona al menos un canal"),
});

export const step2Schema = z.object({
  notion_id: z.string().optional().default(""),
  hubspot_portal_id: z.string().optional().default(""),
});

export const step3Schema = z.object({
  personality_preset: personalityEnum,
  brand_voice_custom: z.string().max(2000).optional().default(""),
  identity: z.enum(["bot", "team_member"]),
  language_primary: z.string().min(1),
  languages_secondary: z.array(z.string()).default([]),
});

export const step4Schema = z.object({
  selected_domains: z.array(z.string()).default([]),
});

export const step5Schema = z.object({
  forbidden_topics: z.string().optional().default(""),
  restricted_products: z.string().optional().default(""),
  no_geographies: z.string().optional().default(""),
  mandatory_disclaimers: z.string().optional().default(""),
  escalation_amount: z.string().optional().default(""),
});

export const actionConfigSchema = z.object({
  name: z.string(),
  enabled: z.boolean().default(false),
  endpoint: z.string().optional().default(""),
  protection: protectionEnum.default("None"),
});

export const step6Schema = z.object({
  actions_list: z.array(actionConfigSchema).default([]),
});

export const blueprintSchema = z.object({
  persona: z.object({
    name: z.string(),
    personality: personalityEnum,
    language_primary: z.string(),
    languages_secondary: z.array(z.string()),
    identity: z.enum(["bot", "team_member"]),
  }),
  top_topics: z.array(z.any()),
  escalation_rules: z.any(),
  lead_qualification: z.any(),
  guardrails: z.any(),
  commercial_signals: z.any(),
  source_inventory: z.array(z.any()),
  short_answers: z.array(z.any()),
  actions: z.array(z.any()),
  creation_plan: z.array(z.any()),
  roadmap: z.any(),
  citation_strategy: z.any(),
  executive_summary: z.string(),
  top_3_pre_launch_actions: z.array(z.string()),
  current_coverage_pct: z.number(),
  projected_coverage_pct_phase_1: z.number(),
});

export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;
export type Step4Values = z.infer<typeof step4Schema>;
export type Step5Values = z.infer<typeof step5Schema>;
export type Step6Values = z.infer<typeof step6Schema>;
