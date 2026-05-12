import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizardStore } from "@/store/wizardStore";
import { step5Schema, type Step5Values } from "@/lib/zod-schemas";
import { StepLayout } from "./StepLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Step5Props {
  onBack: () => void;
  onNext: () => void;
}

export function Step5_Restrictions({ onBack, onNext }: Step5Props) {
  const { formData, updateFormData } = useWizardStore();
  const r = formData.restrictions ?? {};
  const { register, handleSubmit } = useForm<Step5Values>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      forbidden_topics: r.forbidden_topics ?? "",
      restricted_products: r.restricted_products ?? "",
      no_geographies: r.no_geographies ?? "",
      mandatory_disclaimers: r.mandatory_disclaimers ?? "",
      escalation_amount: r.escalation_amount ?? "",
    },
  });

  const submit = handleSubmit((values) => {
    updateFormData({ restrictions: values });
    onNext();
  });

  return (
    <StepLayout
      title="Restricciones"
      subtitle="Define qué temas el agente no debe tocar y cuándo escalar."
      onBack={onBack}
      onNext={submit}
    >
      <div className="grid gap-2">
        <Label htmlFor="forbidden_topics">Temas prohibidos</Label>
        <Textarea
          id="forbidden_topics"
          rows={3}
          placeholder="Temas que el agente no debe discutir bajo ninguna circunstancia."
          {...register("forbidden_topics")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="restricted_products">Productos o servicios restringidos</Label>
        <Textarea
          id="restricted_products"
          rows={3}
          placeholder="Productos discontinuados, en beta o no ofrecidos por región."
          {...register("restricted_products")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="no_geographies">Geografías no atendidas</Label>
        <Textarea
          id="no_geographies"
          rows={2}
          placeholder="Países o regiones donde no operamos."
          {...register("no_geographies")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="mandatory_disclaimers">Disclaimers obligatorios</Label>
        <Textarea
          id="mandatory_disclaimers"
          rows={3}
          placeholder="Texto legal o regulatorio que debe aparecer al entregar precios o promesas."
          {...register("mandatory_disclaimers")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="escalation_amount">
          Monto que dispara escalación inmediata
        </Label>
        <Input
          id="escalation_amount"
          placeholder="Ej: USD 10,000"
          {...register("escalation_amount")}
        />
      </div>
    </StepLayout>
  );
}
