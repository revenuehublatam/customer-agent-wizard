import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, FileText, Sheet, RefreshCw, Check } from "lucide-react";
import { useWizardStore } from "@/store/wizardStore";
import { generateFile, downloadFile } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { StepLayout } from "./StepLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { GeneratedFile } from "@/lib/types";

interface Step8Props {
  onBack: () => void;
}

export function Step8_FileGeneration({ onBack }: Step8Props) {
  const navigate = useNavigate();
  const {
    sessionId,
    clientId,
    blueprint,
    generatedFiles,
    setGeneratedFiles,
    upsertGeneratedFile,
  } = useWizardStore();
  const { toast } = useToast();

  const [busy, setBusy] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<GeneratedFile | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");

  useEffect(() => {
    if (!sessionId) return;
    supabase
      .from("hubspot_agent_generated_files")
      .select("*")
      .eq("session_id", sessionId)
      .then(({ data }) => {
        if (data) setGeneratedFiles(data as GeneratedFile[]);
      });
  }, [sessionId, setGeneratedFiles]);

  const plan = blueprint?.creation_plan ?? [];

  const getFile = (templateId: string) =>
    generatedFiles.find((f) => f.prompt_template_id === templateId);

  const handleGenerate = async (templateId: string) => {
    if (!sessionId) return;
    setBusy(templateId);
    try {
      const result = await generateFile(sessionId, templateId);
      const existing = getFile(templateId);
      upsertGeneratedFile({
        id: result.file_id ?? existing?.id ?? "",
        session_id: sessionId,
        team_id: existing?.team_id ?? "",
        prompt_template_id: templateId,
        filename: existing?.filename ?? `${templateId}.md`,
        output_format: existing?.output_format ?? "md",
        storage_path: result.storage_path,
        preview: result.preview,
        status: "ready",
        approved: existing?.approved ?? false,
        created_at: existing?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      toast({ title: "Archivo generado" });
    } catch (err) {
      toast({
        title: "Error generando archivo",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleApprove = async (file: GeneratedFile) => {
    await supabase
      .from("hubspot_agent_generated_files")
      .update({ approved: true, status: "approved" })
      .eq("id", file.id);
    upsertGeneratedFile({ ...file, approved: true, status: "approved" });
  };

  const handlePreview = async (file: GeneratedFile) => {
    setPreviewFile(file);
    try {
      const content = await downloadFile(file.storage_path);
      setPreviewContent(content);
    } catch (err) {
      setPreviewContent(file.preview ?? "");
    }
  };

  const allApproved =
    plan.length > 0 &&
    plan.every((p) => getFile(p.prompt_template_id)?.approved);

  return (
    <StepLayout
      title="Generación de archivos"
      subtitle="Genera y aprueba cada archivo según el creation plan del blueprint."
      onBack={onBack}
      onNext={allApproved ? () => clientId && navigate(`/clients/${clientId}/export`) : undefined}
      nextLabel="Ir a exportación"
      nextDisabled={!allApproved}
    >
      {plan.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No hay creation plan en el blueprint. Vuelve al paso 7.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {plan.map((item) => {
            const file = getFile(item.prompt_template_id);
            const isBusy = busy === item.prompt_template_id;
            const status = file?.approved
              ? "Aprobado"
              : file
                ? "Listo"
                : isBusy
                  ? "Generando"
                  : "Pendiente";

            return (
              <Card key={item.prompt_template_id}>
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-muted p-2">
                        {item.filename.endsWith(".csv") ? (
                          <Sheet className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.prompt_template_id} · {item.owner}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        file?.approved
                          ? "success"
                          : file
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {status}
                    </Badge>
                  </div>

                  {file?.preview && (
                    <pre className="max-h-32 overflow-hidden rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                      {file.preview.slice(0, 280)}
                    </pre>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerate(item.prompt_template_id)}
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-3 w-3" />
                      )}
                      {file ? "Regenerar" : "Generar"}
                    </Button>
                    {file && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePreview(file)}
                      >
                        Ver y editar
                      </Button>
                    )}
                    {file && !file.approved && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApprove(file)}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Aprobar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!previewFile}
        onOpenChange={(o) => {
          if (!o) setPreviewFile(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.filename}</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={20}
            value={previewContent}
            onChange={(e) => setPreviewContent(e.target.value)}
            className="font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewFile(null)}
            >
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!previewFile) return;
                const mime =
                  previewFile.output_format === "csv"
                    ? "text/csv"
                    : "text/markdown";
                await supabase.storage
                  .from("generated-files")
                  .upload(
                    previewFile.storage_path,
                    new Blob([previewContent], { type: mime }),
                    { upsert: true, contentType: mime },
                  );
                await supabase
                  .from("hubspot_agent_generated_files")
                  .update({ preview: previewContent.slice(0, 800) })
                  .eq("id", previewFile.id);
                toast({ title: "Cambios guardados" });
                setPreviewFile(null);
              }}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </StepLayout>
  );
}
