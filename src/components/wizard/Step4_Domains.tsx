import { useState } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { StepLayout } from "./StepLayout";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const DOMAINS = [
  {
    id: "soporte_postventa",
    title: "Soporte postventa",
    description: "Resolución de incidencias, dudas técnicas, cómo usar el producto.",
  },
  {
    id: "lead_qualification",
    title: "Calificación de leads",
    description: "Preguntas en chat para identificar MQL y SQL.",
  },
  {
    id: "pricing_quoting",
    title: "Precios y cotización",
    description: "Comunicación de precios, descuentos, cotizaciones simples.",
  },
  {
    id: "scheduling",
    title: "Agendamiento",
    description: "Reservar reuniones con ejecutivos o demos.",
  },
  {
    id: "order_tracking",
    title: "Seguimiento de pedidos",
    description: "Estado de envíos, ETAs y devoluciones.",
  },
  {
    id: "kb_search",
    title: "Búsqueda en base de conocimiento",
    description: "Responder con artículos del KB.",
  },
  {
    id: "compliance",
    title: "Compliance y disclaimers",
    description: "Frases legales obligatorias, riesgos.",
  },
  {
    id: "upsell_crosssell",
    title: "Upsell y cross-sell",
    description: "Sugerencias comerciales según señales.",
  },
];

interface Step4Props {
  onBack: () => void;
  onNext: () => void;
}

export function Step4_Domains({ onBack, onNext }: Step4Props) {
  const { formData, updateFormData } = useWizardStore();
  const [selected, setSelected] = useState<string[]>(
    formData.selected_domains ?? [],
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const submit = () => {
    updateFormData({ selected_domains: selected });
    onNext();
  };

  return (
    <StepLayout
      title="Dominios funcionales"
      subtitle="Selecciona qué casos de uso atenderá el agente."
      onBack={onBack}
      onNext={submit}
      nextDisabled={selected.length === 0}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {DOMAINS.map((d) => {
          const checked = selected.includes(d.id);
          return (
            <label
              key={d.id}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-white p-4 text-sm"
            >
              <Checkbox
                className="mt-0.5"
                checked={checked}
                onCheckedChange={() => toggle(d.id)}
              />
              <div className="flex flex-col gap-1">
                <Label className="cursor-pointer">{d.title}</Label>
                <p className="text-xs text-muted-foreground">{d.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </StepLayout>
  );
}
