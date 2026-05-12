import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizardStore } from "@/store/wizardStore";
import { step2Schema, type Step2Values } from "@/lib/zod-schemas";
import { StepLayout } from "./StepLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Step2Props {
  onBack: () => void;
  onNext: () => void;
}

export function Step2_DataSources({ onBack, onNext }: Step2Props) {
  const { formData, updateFormData } = useWizardStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      notion_id: formData.notion_id ?? "",
      hubspot_portal_id: formData.hubspot_portal_id ?? "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateFormData(values);
    onNext();
  });

  return (
    <StepLayout
      title="Fuentes de datos"
      subtitle="Conecta Notion y HubSpot para extraer contexto."
      onBack={onBack}
      onNext={onSubmit}
    >
      <div className="grid gap-2">
        <Label htmlFor="notion_id">Notion Page ID (opcional)</Label>
        <Input
          id="notion_id"
          placeholder="32 caracteres del page id"
          {...register("notion_id")}
        />
        <p className="text-xs text-muted-foreground">
          Repositorio donde vive el FAQ Hub y SOPs del cliente.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="hubspot_portal_id">HubSpot Portal ID</Label>
        <Input id="hubspot_portal_id" {...register("hubspot_portal_id")} />
        {errors.hubspot_portal_id && (
          <p className="text-xs text-destructive">
            {errors.hubspot_portal_id.message as string}
          </p>
        )}
      </div>

      <div>
        <Button
          variant="primary"
          type="button"
          onClick={() =>
            toast({
              title: "OAuth pendiente",
              description:
                "La conexión OAuth con HubSpot se activará en la fase 2. Por ahora guarda el Portal ID.",
            })
          }
        >
          Conectar HubSpot
        </Button>
      </div>
    </StepLayout>
  );
}
