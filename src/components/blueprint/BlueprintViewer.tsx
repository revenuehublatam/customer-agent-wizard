import { useState } from "react";
import type { Blueprint } from "@/lib/types";
import { BlueprintSection } from "./BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface BlueprintViewerProps {
  blueprint: Blueprint;
  onChange?: (next: Blueprint) => void;
}

function priorityBadge(p: string) {
  if (p === "P0") return <Badge variant="destructive">{p}</Badge>;
  if (p === "P1") return <Badge variant="warning">{p}</Badge>;
  return <Badge variant="secondary">{p}</Badge>;
}

export function BlueprintViewer({ blueprint, onChange }: BlueprintViewerProps) {
  const [editable, setEditable] = useState<Blueprint>(blueprint);

  const update = (patch: Partial<Blueprint>) => {
    const next = { ...editable, ...patch };
    setEditable(next);
    onChange?.(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <div className="flex items-center justify-between">
            <h2>Executive Summary</h2>
            <div className="flex gap-2">
              <Badge variant="secondary">
                Coverage actual: {editable.current_coverage_pct}%
              </Badge>
              <Badge variant="success">
                Fase 1: {editable.projected_coverage_pct_phase_1}%
              </Badge>
            </div>
          </div>
          <Textarea
            rows={4}
            value={editable.executive_summary}
            onChange={(e) => update({ executive_summary: e.target.value })}
          />
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Top 3 acciones pre-launch
            </p>
            <ol className="ml-5 list-decimal text-sm">
              {editable.top_3_pre_launch_actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      <BlueprintSection title="Persona" defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label>Nombre</Label>
            <Input
              value={editable.persona.name}
              onChange={(e) =>
                update({
                  persona: { ...editable.persona, name: e.target.value },
                })
              }
            />
          </div>
          <div className="grid gap-1">
            <Label>Personalidad</Label>
            <Input value={editable.persona.personality} readOnly />
          </div>
          <div className="grid gap-1">
            <Label>Idioma principal</Label>
            <Input value={editable.persona.language_primary} readOnly />
          </div>
          <div className="grid gap-1">
            <Label>Identidad</Label>
            <Input value={editable.persona.identity} readOnly />
          </div>
        </div>
      </BlueprintSection>

      <BlueprintSection title={`Top Topics (${editable.top_topics.length})`}>
        <div className="overflow-hidden rounded-md border border-border bg-white text-sm">
          <table className="w-full">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Tema</th>
                <th className="px-3 py-2 text-left">Volumen</th>
                <th className="px-3 py-2 text-left">Complejidad</th>
                <th className="px-3 py-2 text-left">Riesgo</th>
                <th className="px-3 py-2 text-left">Fuente</th>
              </tr>
            </thead>
            <tbody>
              {editable.top_topics.map((t, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2">{t.topic}</td>
                  <td className="px-3 py-2">{t.volume_estimated}</td>
                  <td className="px-3 py-2">{t.complexity}</td>
                  <td className="px-3 py-2">{t.risk_if_fail}</td>
                  <td className="px-3 py-2 text-muted-foreground">{t.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BlueprintSection>

      <BlueprintSection title="Reglas de escalación">
        <div className="grid gap-3 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Triggers automáticos
            </p>
            <ul className="ml-5 list-disc">
              {editable.escalation_rules.auto_triggers.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Nunca intentar
            </p>
            <ul className="ml-5 list-disc">
              {editable.escalation_rules.never_attempt.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </BlueprintSection>

      <BlueprintSection title="Calificación de leads">
        <div className="grid gap-3 text-sm">
          <p>
            Aplica: <strong>{editable.lead_qualification.applies ? "Sí" : "No"}</strong>
          </p>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Criterios MQL
            </p>
            <ul className="ml-5 list-disc">
              {editable.lead_qualification.criteria.MQL.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Criterios SQL
            </p>
            <ul className="ml-5 list-disc">
              {editable.lead_qualification.criteria.SQL.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </BlueprintSection>

      <BlueprintSection title="Guardrails">
        <div className="grid gap-3 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Temas prohibidos
            </p>
            <ul className="ml-5 list-disc">
              {editable.guardrails.forbidden_topics.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Disclaimers obligatorios
            </p>
            <ul className="ml-5 list-disc">
              {editable.guardrails.mandatory_disclaimers.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </BlueprintSection>

      <BlueprintSection
        title={`Source Inventory (${editable.source_inventory.length})`}
      >
        <div className="overflow-hidden rounded-md border border-border bg-white text-sm">
          <table className="w-full">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Tema</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Prioridad</th>
                <th className="px-3 py-2 text-left">Owner</th>
              </tr>
            </thead>
            <tbody>
              {editable.source_inventory.map((s, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2">{s.topic}</td>
                  <td className="px-3 py-2">{s.source_type}</td>
                  <td className="px-3 py-2">{s.status}</td>
                  <td className="px-3 py-2">{priorityBadge(s.priority)}</td>
                  <td className="px-3 py-2">{s.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BlueprintSection>

      <BlueprintSection
        title={`Short Answers (${editable.short_answers.length})`}
      >
        <div className="grid gap-3 text-sm">
          {editable.short_answers.map((sa, i) => (
            <div
              key={i}
              className="rounded-md border border-border bg-white p-3"
            >
              <p className="text-sm font-medium">{sa.question_main}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {sa.answer_literal}
              </p>
            </div>
          ))}
        </div>
      </BlueprintSection>

      <BlueprintSection title={`Actions (${editable.actions.length})`}>
        <div className="overflow-hidden rounded-md border border-border bg-white text-sm">
          <table className="w-full">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">Protección</th>
                <th className="px-3 py-2 text-left">Sistema</th>
                <th className="px-3 py-2 text-left">Custom dev</th>
              </tr>
            </thead>
            <tbody>
              {editable.actions.map((a, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2">{a.name}</td>
                  <td className="px-3 py-2">{a.protection}</td>
                  <td className="px-3 py-2">{a.system}</td>
                  <td className="px-3 py-2">
                    {a.requires_custom_dev ? "Sí" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BlueprintSection>

      <BlueprintSection
        title={`Creation Plan (${editable.creation_plan.length} archivos)`}
      >
        <div className="overflow-hidden rounded-md border border-border bg-white text-sm">
          <table className="w-full">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Archivo</th>
                <th className="px-3 py-2 text-left">Template</th>
                <th className="px-3 py-2 text-left">Owner</th>
                <th className="px-3 py-2 text-left">Horas</th>
              </tr>
            </thead>
            <tbody>
              {editable.creation_plan.map((c, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{c.filename}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {c.prompt_template_id}
                  </td>
                  <td className="px-3 py-2">{c.owner}</td>
                  <td className="px-3 py-2">{c.estimated_hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BlueprintSection>

      <BlueprintSection title="Roadmap">
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          {(["phase_1", "phase_2", "phase_3"] as const).map((p) => (
            <div key={p} className="rounded-md border border-border bg-white p-3">
              <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                {p.replace("_", " ")}
              </p>
              <ul className="ml-5 list-disc">
                {editable.roadmap[p].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </BlueprintSection>

      <BlueprintSection title="Citation Strategy">
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Citable público
            </p>
            <ul className="ml-5 list-disc">
              {editable.citation_strategy.public_citable.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Solo privado
            </p>
            <ul className="ml-5 list-disc">
              {editable.citation_strategy.private_only.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              No debe aparecer
            </p>
            <ul className="ml-5 list-disc">
              {editable.citation_strategy.must_not_appear.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </BlueprintSection>
    </div>
  );
}
