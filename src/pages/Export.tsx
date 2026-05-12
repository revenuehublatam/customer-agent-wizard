import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AppShell } from "@/components/layout/AppShell";
import { ExportView } from "@/components/export/ExportView";

export default function Export() {
  const { id: clientId } = useParams();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!clientId) return;
    supabase
      .from("clients")
      .select("name")
      .eq("id", clientId)
      .single()
      .then(({ data }) => setName(data?.name ?? ""));
  }, [clientId]);

  return (
    <AppShell clientName={name}>
      <div className="flex-1 overflow-auto bg-background">
        <ExportView />
      </div>
    </AppShell>
  );
}
