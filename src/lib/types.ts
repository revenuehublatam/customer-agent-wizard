export type Personality =
  | "Professional"
  | "Friendly"
  | "Casual"
  | "Empathetic"
  | "Witty";

export type Priority = "P0" | "P1" | "P2";
export type Owner = "client" | "revenue_hub";
export type Protection = "None" | "MatchEmail" | "VerifyEmail";

export interface Persona {
  name: string;
  personality: Personality;
  language_primary: string;
  languages_secondary: string[];
  identity: "bot" | "team_member";
}

export interface TopTopic {
  topic: string;
  volume_estimated: "high" | "med" | "low";
  complexity: number;
  risk_if_fail: "high" | "med" | "low";
  canonical_answer: string;
  source: string;
}

export interface EscalationRules {
  auto_triggers: string[];
  routing: Record<string, string>;
  sla_by_channel: Record<string, string>;
  never_attempt: string[];
}

export interface LeadQualification {
  applies: boolean;
  questions: { id: string; text: string; branches: Record<string, string> }[];
  criteria: { MQL: string[]; SQL: string[]; rejected: string[] };
  final_action: { MQL: string; SQL: string; rejected: string };
}

export interface Guardrails {
  forbidden_topics: string[];
  sensitive_info: string[];
  mandatory_disclaimers: string[];
}

export interface CommercialSignals {
  buy_intent_phrases: string[];
  competitor_mentions: string[];
  upsell_triggers: string[];
}

export interface SourceItem {
  topic: string;
  source_type: string;
  status: "EXISTS" | "CREATE" | "REFACTOR";
  action: string;
  priority: Priority;
  owner: Owner;
}

export interface ShortAnswer {
  question_main: string;
  variants: string[];
  answer_literal: string;
  reason: string;
}

export interface AgentAction {
  name: string;
  description: string;
  triggers: string[];
  protection: Protection;
  system: string;
  requires_custom_dev: boolean;
}

export interface CreationPlanItem {
  filename: string;
  prompt_template_id: string;
  owner: Owner;
  estimated_hours: number;
  data_source: string;
}

export interface Roadmap {
  phase_1: string[];
  phase_2: string[];
  phase_3: string[];
}

export interface CitationStrategy {
  public_citable: string[];
  private_only: string[];
  must_not_appear: string[];
}

export interface Blueprint {
  persona: Persona;
  top_topics: TopTopic[];
  escalation_rules: EscalationRules;
  lead_qualification: LeadQualification;
  guardrails: Guardrails;
  commercial_signals: CommercialSignals;
  source_inventory: SourceItem[];
  short_answers: ShortAnswer[];
  actions: AgentAction[];
  creation_plan: CreationPlanItem[];
  roadmap: Roadmap;
  citation_strategy: CitationStrategy;
  executive_summary: string;
  top_3_pre_launch_actions: string[];
  current_coverage_pct: number;
  projected_coverage_pct_phase_1: number;
}

export interface Client {
  id: string;
  team_id: string;
  name: string;
  industry: string | null;
  website_url: string | null;
  primary_product: string | null;
  channels: string[];
  status: string;
  notion_id: string | null;
  hubspot_portal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WizardSession {
  id: string;
  client_id: string;
  team_id: string;
  current_step: number;
  form_data: WizardFormData;
  blueprint: Blueprint | null;
  blueprint_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface WizardFormData {
  client_name?: string;
  industry?: string;
  website_url?: string;
  primary_product?: string;
  channels?: string[];
  notion_id?: string;
  hubspot_portal_id?: string;
  personality_preset?: Personality;
  brand_voice_custom?: string;
  identity?: "bot" | "team_member";
  language_primary?: string;
  languages_secondary?: string[];
  selected_domains?: string[];
  restrictions?: {
    forbidden_topics?: string;
    restricted_products?: string;
    no_geographies?: string;
    mandatory_disclaimers?: string;
    escalation_amount?: string;
  };
  actions_list?: ActionConfig[];
}

export interface ActionConfig {
  name: string;
  enabled: boolean;
  endpoint?: string;
  protection: Protection;
}

export interface GeneratedFile {
  id: string;
  session_id: string;
  team_id: string;
  prompt_template_id: string;
  filename: string;
  output_format: "md" | "csv" | "blueprint";
  storage_path: string;
  preview: string | null;
  status: "pending" | "generating" | "ready" | "approved" | "error";
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValidationCheck {
  id: string;
  client_id: string;
  team_id: string;
  check_type: string;
  status: "pass" | "fail" | "warning";
  details: Record<string, unknown>;
  created_at: string;
}
