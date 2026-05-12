import { useState } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { StepLayout } from "./StepLayout";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActionConfig, Protection } from "@/lib/types";

const DEFAULT_ACTIONS: ActionConfig[] = [
  { name: "Consultar estado de pedido", enabled: false, endpoint: "", protection: "MatchEmail" },
  { name: "Agendar reunión con ejecutivo", enabled: false, endpoint: "", protection: "None" },
  { name: "Reset de contraseña", enabled: false, endpoint: "", protection: "VerifyEmail" },
  { name: "Consultar factura", enabled: false, endpoint: "", protection: "VerifyEmail" },
  { name: "Crear ticket en HubSpot", enabled: false, endpoint: "", protection: "None" },
  { name: "Solicitar cotización", enabled: false, endpoint: "", protection: "None" },
];

interface Step6Props {
  onBack: () => void;
  onNext: () => void;
}

export function Step6_Actions({ onBack, onNext }: Step6Props) {
  const { formData, updateFormData } = useWizardStore();
  const [rows, setRows] = useState<ActionConfig[]>(
    (formData.actions_list && formData.actions_list.length > 0
      ? formData.actions_list
      : DEFAULT_ACTIONS).map((r) => ({ ...r })),
  );

  const update = (idx: number, patch: Partial<ActionConfig>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const submit = () => {
    updateFormData({ actions_list: rows });
    onNext();
  };

  return (
    <StepLayout
      title="Actions"
      subtitle="Define qué acciones puede ejecutar el agente vía API."
      onBack={onBack}
      onNext={submit}
    >
      <div className="overflow-hidden rounded-md border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="w-12 px-3 py-2 text-left">Usar</th>
              <th className="px-3 py-2 text-left">Action</th>
              <th className="px-3 py-2 text-left">Endpoint</th>
              <th className="w-44 px-3 py-2 text-left">Protección</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.name}
                className="border-t border-border align-middle"
              >
                <td className="px-3 py-3">
                  <Checkbox
                    checked={row.enabled}
                    onCheckedChange={(v) => update(idx, { enabled: Boolean(v) })}
                  />
                </td>
                <td className="px-3 py-3 font-medium">{row.name}</td>
                <td className="px-3 py-3">
                  <Input
                    placeholder="https://api.cliente.com/..."
                    value={row.endpoint ?? ""}
                    onChange={(e) => update(idx, { endpoint: e.target.value })}
                  />
                </td>
                <td className="px-3 py-3">
                  <Select
                    value={row.protection}
                    onValueChange={(v) =>
                      update(idx, { protection: v as Protection })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">Ninguna</SelectItem>
                      <SelectItem value="MatchEmail">Match Email</SelectItem>
                      <SelectItem value="VerifyEmail">Verify Email</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StepLayout>
  );
}
