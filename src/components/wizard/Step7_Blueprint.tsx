import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useWizardStore } from "@/store/wizardStore";
import { generateBlueprint } from "@/lib/api";
import { StepLayout } from "./StepLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BlueprintViewer } from "@/components/blueprint/BlueprintViewer";
import { useToast } from "@/components/ui/use-toast";

interface Step7Props {
  onBack: () => void;
  onNext: () => void;
}

export function Step7_Blueprint({ onBack, onNext }: Step7Props) {
  const { sessionId, blueprint, setBlueprint, setBlueprintApproved, blueprintApproved } =
    useWizardStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const { blueprint: bp } = await generateBlueprint(sessionId);
      setBlueprint(bp);
      toast({ title: "Blueprint generado" });
    } catch (err) {
      toast({
        title: "Error generando blueprint",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setBlueprintApproved(true);
    toast({ title: "Blueprint aprobado" });
    onNext();
  };

  return (
    <StepLayout
      title="Blueprint"
      subtitle="Genera el plan de configuración. Edítalo y apruébalo cuando esté listo."
      onBack={onBack}
    >
      {!blueprint && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <h2>Genera el blueprint</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Usamos toda la información de los pasos anteriores para producir un
              plan ejecutable de configuración del Customer Agent.
            </p>
            <Button onClick={handleGenerate} disabled={loading} variant="primary">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generar blueprint
            </Button>
          </CardContent>
        </Card>
      )}

      {blueprint && (
        <div className="flex flex-col gap-4">
          <BlueprintViewer blueprint={blueprint} onChange={setBlueprint} />
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="outline" onClick={handleGenerate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Regenerar
            </Button>
            <Button variant="primary" onClick={handleApprove}>
              {blueprintApproved ? "Continuar" : "Aprobar blueprint"}
            </Button>
          </div>
        </div>
      )}
    </StepLayout>
  );
}
