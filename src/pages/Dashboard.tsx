import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { useToast } from "@/components/ui/use-toast";
import type { Client } from "@/lib/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const loadClients = async () => {
    const { data } = await supabase
      .from("hubspot_agent_clients")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setClients(data as unknown as Client[]);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const ensureProfile = async () => {
    if (!user) return null;
    const { data: profile } = await supabase
      .from("hubspot_agent_profiles")
      .select("team_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.team_id) return profile.team_id;

    const { data: team } = await supabase
      .from("hubspot_agent_teams")
      .insert({ name: user.email ?? "Mi equipo" })
      .select()
      .single();
    if (!team) throw new Error("could not create team");

    await supabase.from("hubspot_agent_profiles").upsert({
      id: user.id,
      team_id: team.id,
      role: "owner",
    });

    return team.id;
  };

  const createClient = async () => {
    if (!user) return;
    try {
      const teamId = await ensureProfile();
      if (!teamId) throw new Error("team missing");
      const { data, error } = await supabase
        .from("hubspot_agent_clients")
        .insert({
          team_id: teamId,
          name: newName,
          status: "in_progress",
          channels: [],
        })
        .select()
        .single();
      if (error) throw error;
      setOpen(false);
      setNewName("");
      navigate(`/clients/${data.id}/wizard`);
    } catch (err) {
      toast({
        title: "Error creando cliente",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge variant="success">Aprobado</Badge>;
    if (s === "exported") return <Badge variant="default">Exportado</Badge>;
    return <Badge variant="secondary">En progreso</Badge>;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-3 w-3" />
            Salir
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1>Clientes</h1>
            <p className="text-sm text-muted-foreground">
              Selecciona un cliente para continuar o crea uno nuevo.
            </p>
          </div>
          <Button variant="primary" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Industria</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Actualizado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      Aún no hay clientes. Crea el primero.
                    </td>
                  </tr>
                ) : (
                  clients.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.industry ?? "-"}
                      </td>
                      <td className="px-4 py-3">{statusBadge(c.status)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(c.updated_at).toLocaleDateString("es")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/clients/${c.id}/wizard`}>
                          <Button size="sm" variant="outline">
                            Continuar
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="new_name">Nombre del cliente</Label>
            <Input
              id="new_name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Acme Industria"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={createClient}
              disabled={!newName.trim()}
            >
              Crear y empezar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
