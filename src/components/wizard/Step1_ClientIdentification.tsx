import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizardStore } from "@/store/wizardStore";
import { step1Schema, type Step1Values } from "@/lib/zod-schemas";
import { StepLayout } from "./StepLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const INDUSTRIES = [
  "B2B Manufactura",
  "SaaS",
  "Servicios Profesionales",
  "Construcción",
  "Edtech",
  "Legaltech",
  "Otro",
];

const CHANNELS = ["Web Chat", "Email", "WhatsApp", "Portal de Soporte"];

interface Step1Props {
  onNext: () => void;
}

export function Step1_ClientIdentification({ onNext }: Step1Props) {
  const { formData, updateFormData, clientId } = useWizardStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    mode: "onChange",
    defaultValues: {
      client_name: formData.client_name ?? "",
      industry: formData.industry ?? "",
      website_url: formData.website_url ?? "",
      primary_product: formData.primary_product ?? "",
      channels: formData.channels ?? [],
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    updateFormData(values);
    if (clientId) {
      await supabase
        .from("clients")
        .update({
          name: values.client_name,
          industry: values.industry,
          website_url: values.website_url,
          primary_product: values.primary_product,
          channels: values.channels,
        })
        .eq("id", clientId);
    }
    onNext();
  });

  return (
    <StepLayout
      title="Identificación del cliente"
      subtitle="Información básica para arrancar la configuración."
      onNext={onSubmit}
      nextDisabled={!isValid}
    >
      <div className="grid gap-2">
        <Label htmlFor="client_name">Nombre del cliente</Label>
        <Input id="client_name" {...register("client_name")} />
        {errors.client_name && (
          <p className="text-xs text-destructive">{errors.client_name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label>Industria</Label>
        <Controller
          control={control}
          name="industry"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una industria" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.industry && (
          <p className="text-xs text-destructive">{errors.industry.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="website_url">Sitio web</Label>
        <Input
          id="website_url"
          placeholder="https://"
          {...register("website_url")}
        />
        {errors.website_url && (
          <p className="text-xs text-destructive">{errors.website_url.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="primary_product">Producto o servicio principal</Label>
        <Input id="primary_product" {...register("primary_product")} />
        {errors.primary_product && (
          <p className="text-xs text-destructive">
            {errors.primary_product.message}
          </p>
        )}
      </div>

      <div className="grid gap-3">
        <Label>Canales objetivo</Label>
        <Controller
          control={control}
          name="channels"
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {CHANNELS.map((c) => {
                const checked = (field.value ?? []).includes(c);
                return (
                  <label
                    key={c}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-white p-3 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => {
                        field.onChange(
                          (() => {
                            const set = new Set(field.value ?? []);
                            if (set.has(c)) set.delete(c);
                            else set.add(c);
                            return Array.from(set);
                          })(),
                        );
                      }}
                    />
                    <span>{c}</span>
                  </label>
                );
              })}
            </div>
          )}
        />
        {errors.channels && (
          <p className="text-xs text-destructive">{errors.channels.message as string}</p>
        )}
      </div>
    </StepLayout>
  );
}
