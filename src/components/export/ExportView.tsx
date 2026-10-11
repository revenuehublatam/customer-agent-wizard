import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, ShieldCheck, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validateHubspot } from "@/lib/api";
import { exportAsZip, triggerDownload } from "@/lib/zipExporter";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import type { Client, GeneratedFile, ValidationCheck } from "@/lib/types";

export function ExportView() {
  const { id: clientId } = useParams();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [checks, setChecks] = useState<ValidationCheck[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    (async () => {
      const { data: c } = await supabase
        .from("hubspot_agent_clients")
        .select("*")
        .eq("id", clientId)
        .single();
      if (c) setClient(c as unknown as Client);

      const { data: sessions } = await supabase
        .from("hubspot_agent_wizard_sessions")
        .select("id")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(1);
      const sessionId = sessions?.[0]?.id;
      if (sessionId) {
        const { data: f } = await supabase
          .from("hubspot_agent_generated_files")
          .select("*")
          .eq("session_id", sessionId)
          .eq("approved", true);
        if (f) setFiles(f as GeneratedFile[]);
      }

      const { data: vc } = await supabase
        .from("hubspot_agent_validation_checks")
        .select("*")
        .eq("client_id", clientId);
      if (vc) setChecks(vc as ValidationCheck[]);
    })();
  }, [clientId]);

  const handleDownload = async () => {
    if (!client) return;
    setDownloading(true);
    try {
      const blob = await exportAsZip(client, files);
      triggerDownload(blob, `customer-agent-${slugify(client.name)}.zip`);
    } catch (err) {
      toast({
        title: "Error generando .zip",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleValidate = async () => {
    if (!clientId) return;
    setValidating(true);
    try {
      const { checks: newChecks } = await validateHubspot(clientId);
      setChecks(newChecks as ValidationCheck[]);
      toast({ title: "Validación completada" });
    } catch (err) {
      toast({
        title: "Error validando HubSpot",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setValidating(false);
    }
  };

  const renderStatus = (status: string) => {
    if (status === "pass") return <Badge variant="success">Pass</Badge>;
    if (status === "warning") return <Badge variant="warning">Warning</Badge>;
    return <Badge variant="destructive">Fail</Badge>;
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-8 py-10">
      <header className="flex flex-col gap-1">
        <h1>Exportación</h1>
        <p className="text-sm text-muted-foreground">
          Descarga el paquete listo para cargar en HubSpot y valida el portal.
        </p>
      </header>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-semibold">Archivos aprobados</p>
            <p className="text-xs text-muted-foreground">
              {files.length} archivo(s) listos para empaquetar.
            </p>
          </div>
          <Button
            onClick={handleDownload}
            disabled={downloading || files.length === 0}
            variant="primary"
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar .zip
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Validación HubSpot</p>
              <p className="text-xs text-muted-foreground">
                Ejecuta chequeos contra el portal del cliente.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleValidate}
              disabled={validating}
            >
              {validating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Validar HubSpot
            </Button>
          </div>

          {checks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay validaciones. Ejecuta para revisar el portal.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {checks.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-md border border-border bg-white px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    {c.status === "pass" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle
                        className={
                          c.status === "warning"
                            ? "h-4 w-4 text-yellow-600"
                            : "h-4 w-4 text-red-600"
                        }
                      />
                    )}
                    <span className="font-medium">{c.check_type}</span>
                  </div>
                  {renderStatus(c.status)}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
