import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizardStore } from "@/store/wizardStore";
import { step3Schema, type Step3Values } from "@/lib/zod-schemas";
import { StepLayout } from "./StepLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const PERSONALITIES: { id: Step3Values["personality_preset"]; description: string; recommended?: boolean }[] = [
  { id: "Professional", description: "Tono formal, claro, orientado a negocio.", recommended: true },
  { id: "Friendly", description: "Cercano sin perder profesionalismo." },
  { id: "Casual", description: "Coloquial, ideal para audiencias jóvenes." },
  { id: "Empathetic", description: "Sensible, soporte y resolución de problemas." },
  { id: "Witty", description: "Ingenioso, marcas con voz distintiva." },
];

const LANGUAGES = [
  "Español LATAM",
  "Español ES",
  "Inglés",
  "Portugués",
];

interface Step3Props {
  onBack: () => void;
  onNext: () => void;
}

export function Step3_ToneVoice({ onBack, onNext }: Step3Props) {
  const { formData, updateFormData } = useWizardStore();
  const {
    handleSubmit,
    control,
    watch,
    register,
    formState: { isValid },
  } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    mode: "onChange",
    defaultValues: {
      personality_preset: formData.personality_preset ?? "Professional",
      brand_voice_custom: formData.brand_voice_custom ?? "",
      identity: formData.identity ?? "bot",
      language_primary: formData.language_primary ?? "Español LATAM",
      languages_secondary: formData.languages_secondary ?? [],
    },
  });

  const brandVoice = watch("brand_voice_custom") ?? "";

  const onSubmit = handleSubmit((values) => {
    updateFormData(values);
    onNext();
  });

  return (
    <StepLayout
      title="Tono y voz"
      subtitle="Cómo habla el agente con tus clientes."
      onBack={onBack}
      onNext={onSubmit}
      nextDisabled={!isValid}
    >
      <div className="grid gap-3">
        <Label>Personalidad</Label>
        <Controller
          control={control}
          name="personality_preset"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-2"
            >
              {PERSONALITIES.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-white p-3 text-sm"
                >
                  <RadioGroupItem value={p.id} className="mt-0.5" />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.id}</span>
                      {p.recommended && (
                        <Badge variant="accent">Recomendado para B2B LATAM</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {p.description}
                    </span>
                  </div>
                </label>
              ))}
            </RadioGroup>
          )}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="brand_voice_custom">
          Brand voice personalizado (opcional, máx 200 palabras)
        </Label>
        <Textarea
          id="brand_voice_custom"
          rows={4}
          maxLength={2000}
          {...register("brand_voice_custom")}
        />
        <p className="text-xs text-muted-foreground">
          {brandVoice.length} caracteres
        </p>
      </div>

      <div className="grid gap-3">
        <Label>Identidad</Label>
        <Controller
          control={control}
          name="identity"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-2 sm:grid-cols-2"
            >
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-white p-3 text-sm">
                <RadioGroupItem value="bot" />
                <span>Bot (declarado como asistente)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-white p-3 text-sm">
                <RadioGroupItem value="team_member" />
                <span>Miembro del equipo (con nombre)</span>
              </label>
            </RadioGroup>
          )}
        />
      </div>

      <div className="grid gap-2">
        <Label>Idioma principal</Label>
        <Controller
          control={control}
          name="language_primary"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid gap-2">
        <Label>Idiomas secundarios</Label>
        <Controller
          control={control}
          name="languages_secondary"
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {LANGUAGES.map((l) => {
                const checked = (field.value ?? []).includes(l);
                return (
                  <label
                    key={l}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-white p-3 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => {
                        const set = new Set(field.value ?? []);
                        if (set.has(l)) set.delete(l);
                        else set.add(l);
                        field.onChange(Array.from(set));
                      }}
                    />
                    <span>{l}</span>
                  </label>
                );
              })}
            </div>
          )}
        />
      </div>
    </StepLayout>
  );
}
