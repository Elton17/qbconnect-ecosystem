import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building2, ShoppingBag, GraduationCap, CalendarDays, Handshake, Gift, Trophy,
  CheckCircle2, XCircle, Search, Users, BarChart3, Eye, Trash2, ToggleLeft,
  ToggleRight, Shield, Loader2, Tag,
} from "lucide-react";

interface Stat { label: string; value: number; icon: any; }

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stat[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("overview");

  // Fetch all data
  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  async function fetchAll() {
    setLoading(true);
    const [
      profilesRes, productsRes, coursesRes, eventsRes,
      oppsRes, benefitsRes, promosRes, rolesRes,
      enrollRes, eventRegRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("opportunities").select("*").order("created_at", { ascending: false }),
      supabase.from("benefits").select("*").order("created_at", { ascending: false }),
      supabase.from("promotions").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("course_enrollments").select("id", { count: "exact", head: true }),
      supabase.from("event_registrations").select("id", { count: "exact", head: true }),
    ]);

    const p = profilesRes.data || [];
    const pr = productsRes.data || [];
    const c = coursesRes.data || [];
    const ev = eventsRes.data || [];
    const op = oppsRes.data || [];
    const b = benefitsRes.data || [];
    const pm = promosRes.data || [];

    setProfiles(p);
    setProducts(pr);
    setCourses(c);
    setEvents(ev);
    setOpportunities(op);
    setBenefits(b);
    setPromotions(pm);
    setUserRoles(rolesRes.data || []);

    setStats([
      { label: "Empresas", value: p.length, icon: Building2 },
      { label: "Produtos", value: pr.length, icon: ShoppingBag },
      { label: "Cursos", value: c.length, icon: GraduationCap },
      { label: "Eventos", value: ev.length, icon: CalendarDays },
      { label: "Oportunidades", value: op.length, icon: Handshake },
      { label: "Benefícios", value: b.length, icon: Gift },
      { label: "Promoções", value: pm.length, icon: Tag },
      { label: "Matrículas", value: enrollRes.count || 0, icon: Users },
      { label: "Inscrições Eventos", value: eventRegRes.count || 0, icon: Trophy },
    ]);

    setLoading(false);
  }

  // ── Actions ──
  async function toggleApproval(profileId: string, current: boolean) {
    const { error } = await supabase.from("profiles").update({ approved: !current }).eq("id", profileId);
    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success(!current ? "Empresa aprovada!" : "Aprovação removida");
    setProfiles((prev) => prev.map((p) => p.id === profileId ? { ...p, approved: !current } : p));
  }

  async function toggleActive(table: string, id: string, current: boolean, setter: Function) {
    const { error } = await (supabase.from(table as any) as any).update({ active: !current }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success(!current ? "Ativado!" : "Desativado!");
    setter((prev: any[]) => prev.map((item: any) => item.id === id ? { ...item, active: !current } : item));
  }

  async function deleteRecord(table: string, id: string, setter: Function) {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Excluído com sucesso");
    setter((prev: any[]) => prev.filter((item: any) => item.id !== id));
  }

  async function setRole(userId: string, role: "admin" | "moderator" | "user") {
    const existing = userRoles.find((r: any) => r.user_id === userId && r.role === role);
    if (existing) { toast.info("Usuário já possui esse papel"); return; }

    await supabase.from("user_roles").delete().eq("user_id", userId as any);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role } as any);
    if (error) { toast.error("Erro ao definir papel"); return; }
    toast.success(`Papel definido como ${role}`);
    fetchAll();
  }

  // ── Filter helper ──
  function filterBySearch<T extends Record<string, any>>(items: T[], fields: string[]): T[] {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) => fields.some((f) => String(item[f] || "").toLowerCase().includes(q)));
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingProfiles = profiles.filter((p) => !p.approved);

  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gestão completa da plataforma</p>
          </div>
          {pendingProfiles.length > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {pendingProfiles.length} empresa(s) pendente(s)
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-3 lg:grid-cols-9">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
              <s.icon className="mx-auto mb-1 h-5 w-5 text-primary" />
              <div className="text-xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar em todos os módulos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="companies">Empresas ({profiles.length})</TabsTrigger>
            <TabsTrigger value="products">Produtos ({products.length})</TabsTrigger>
            <TabsTrigger value="courses">Cursos ({courses.length})</TabsTrigger>
            <TabsTrigger value="events">Eventos ({events.length})</TabsTrigger>
            <TabsTrigger value="opportunities">Oportunidades ({opportunities.length})</TabsTrigger>
            <TabsTrigger value="benefits">Benefícios ({benefits.length})</TabsTrigger>
            <TabsTrigger value="promotions">Promoções ({promotions.length})</TabsTrigger>
            <TabsTrigger value="roles">Papéis</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pending approvals */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-bold text-card-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Aprovações Pendentes
                </h2>
                {pendingProfiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma empresa pendente 🎉</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {pendingProfiles.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-card-foreground truncate">{p.company_name || "Sem nome"}</div>
                          <div className="text-xs text-muted-foreground">{p.cnpj} · {p.city}</div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" onClick={() => toggleApproval(p.id, p.approved)}>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Aprovar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent items */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-bold text-card-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Itens Recentes
                </h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {[
                    ...products.slice(0, 3).map((p) => ({ type: "Produto", title: p.title, active: p.active })),
                    ...courses.slice(0, 3).map((c) => ({ type: "Curso", title: c.title, active: c.active })),
                    ...events.slice(0, 3).map((e) => ({ type: "Evento", title: e.title, active: e.active })),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="secondary" className="text-[10px] shrink-0">{item.type}</Badge>
                        <span className="text-sm text-card-foreground truncate">{item.title}</span>
                      </div>
                      <Badge variant={item.active ? "default" : "outline"} className="text-[10px]">
                        {item.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── COMPANIES ── */}
          <TabsContent value="companies">
            <AdminTable
              items={filterBySearch(profiles, ["company_name", "cnpj", "city", "email", "segment"])}
              columns={[
                { key: "company_name", label: "Empresa" },
                { key: "cnpj", label: "CNPJ" },
                { key: "city", label: "Cidade" },
                { key: "segment", label: "Segmento" },
                { key: "plan", label: "Plano" },
              ]}
              renderStatus={(item) => (
                <Badge variant={item.approved ? "default" : "destructive"} className="text-[10px]">
                  {item.approved ? "Aprovada" : "Pendente"}
                </Badge>
              )}
              actions={(item) => (
                <>
                  <Button size="sm" variant={item.approved ? "outline" : "default"} onClick={() => toggleApproval(item.id, item.approved)}>
                    {item.approved ? <XCircle className="mr-1 h-3 w-3" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {item.approved ? "Revogar" : "Aprovar"}
                  </Button>
                  <RoleSelector userId={item.user_id} roles={userRoles} onSetRole={setRole} />
                  <Button size="sm" variant="destructive" onClick={() => deleteRecord("profiles", item.id, setProfiles)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            />
          </TabsContent>

          {/* ── PRODUCTS ── */}
          <TabsContent value="products">
            <AdminTable
              items={filterBySearch(products, ["title", "category", "description"])}
              columns={[
                { key: "title", label: "Título" },
                { key: "category", label: "Categoria" },
                { key: "price", label: "Preço", render: (v: number) => `R$ ${Number(v).toFixed(2)}` },
              ]}
              renderStatus={(item) => <ActiveBadge active={item.active} />}
              actions={(item) => (
                <>
                  <ToggleActiveBtn active={item.active} onClick={() => toggleActive("products", item.id, item.active, setProducts)} />
                  <Button size="sm" variant="destructive" onClick={() => deleteRecord("products", item.id, setProducts)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            />
          </TabsContent>

          {/* ── COURSES ── */}
          <TabsContent value="courses">
            <AdminTable
              items={filterBySearch(courses, ["title", "category"])}
              columns={[
                { key: "title", label: "Título" },
                { key: "category", label: "Categoria" },
                { key: "duration", label: "Duração" },
              ]}
              renderStatus={(item) => (
                <div className="flex gap-1">
                  <ActiveBadge active={item.active} />
                  {item.premium && <Badge className="text-[10px] bg-amber-500">Premium</Badge>}
                </div>
              )}
              actions={(item) => (
                <>
                  <ToggleActiveBtn active={item.active} onClick={() => toggleActive("courses", item.id, item.active, setCourses)} />
                  <Button size="sm" variant="destructive" onClick={() => deleteRecord("courses", item.id, setCourses)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            />
          </TabsContent>

          {/* ── EVENTS ── */}
          <TabsContent value="events">
            <AdminTable
              items={filterBySearch(events, ["title", "category", "city"])}
              columns={[
                { key: "title", label: "Título" },
                { key: "category", label: "Categoria" },
                { key: "city", label: "Cidade" },
                { key: "event_type", label: "Tipo" },
              ]}
              renderStatus={(item) => <ActiveBadge active={item.active} />}
              actions={(item) => (
                <>
                  <ToggleActiveBtn active={item.active} onClick={() => toggleActive("events", item.id, item.active, setEvents)} />
                  <Button size="sm" variant="destructive" onClick={() => deleteRecord("events", item.id, setEvents)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            />
          </TabsContent>

          {/* ── OPPORTUNITIES ── */}
          <TabsContent value="opportunities">
            <AdminTable
              items={filterBySearch(opportunities, ["title", "type", "description"])}
              columns={[
                { key: "title", label: "Título" },
                { key: "type", label: "Tipo" },
                { key: "value", label: "Valor" },
              ]}
              renderStatus={(item) => (
                <div className="flex gap-1">
                  <ActiveBadge active={item.active} />
                  {item.urgent && <Badge variant="destructive" className="text-[10px]">Urgente</Badge>}
                </div>
              )}
              actions={(item) => (
                <>
                  <ToggleActiveBtn active={item.active} onClick={() => toggleActive("opportunities", item.id, item.active, setOpportunities)} />
                  <Button size="sm" variant="destructive" onClick={() => deleteRecord("opportunities", item.id, setOpportunities)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            />
          </TabsContent>

          {/* ── BENEFITS ── */}
          <TabsContent value="benefits">
            <AdminTable
              items={filterBySearch(benefits, ["offer", "category"])}
              columns={[
                { key: "offer", label: "Oferta" },
                { key: "category", label: "Categoria" },
              ]}
              renderStatus={(item) => (
                <div className="flex gap-1">
                  <ActiveBadge active={item.active} />
                  {item.exclusive && <Badge className="text-[10px] bg-purple-500">Exclusivo</Badge>}
                </div>
              )}
              actions={(item) => (
                <>
                  <ToggleActiveBtn active={item.active} onClick={() => toggleActive("benefits", item.id, item.active, setBenefits)} />
                  <Button size="sm" variant="destructive" onClick={() => deleteRecord("benefits", item.id, setBenefits)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            />
          </TabsContent>

          {/* ── PROMOTIONS ── */}
          <TabsContent value="promotions">
            <AdminTable
              items={filterBySearch(promotions, ["title", "category"])}
              columns={[
                { key: "title", label: "Título" },
                { key: "category", label: "Categoria" },
                { key: "discount_percent", label: "Desconto", render: (v: number) => `${v}%` },
              ]}
              renderStatus={(item) => <ActiveBadge active={item.active} />}
              actions={(item) => (
                <>
                  <ToggleActiveBtn active={item.active} onClick={() => toggleActive("promotions", item.id, item.active, setPromotions)} />
                  <Button size="sm" variant="destructive" onClick={() => deleteRecord("promotions", item.id, setPromotions)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            />
          </TabsContent>

          {/* ── ROLES ── */}
          <TabsContent value="roles">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-bold text-card-foreground">Gestão de Papéis</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Para alterar o papel de um usuário, acesse a aba "Empresas" e use o seletor de papel ao lado da empresa.
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {profiles.map((p) => {
                  const role = userRoles.find((r) => r.user_id === p.user_id);
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold text-card-foreground">{p.company_name || p.email}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={role?.role === "admin" ? "destructive" : role?.role === "moderator" ? "default" : "secondary"}>
                          {role?.role || "user"}
                        </Badge>
                        <RoleSelector userId={p.user_id} roles={userRoles} onSetRole={setRole} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ── Reusable sub-components ──

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "default" : "outline"} className="text-[10px]">
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}

function ToggleActiveBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <Button size="sm" variant="outline" onClick={onClick} title={active ? "Desativar" : "Ativar"}>
      {active ? <ToggleRight className="h-3.5 w-3.5 text-primary" /> : <ToggleLeft className="h-3.5 w-3.5" />}
    </Button>
  );
}

function RoleSelector({ userId, roles, onSetRole }: { userId: string; roles: any[]; onSetRole: (uid: string, role: "admin" | "moderator" | "user") => void }) {
  const current = roles.find((r) => r.user_id === userId)?.role || "user";
  return (
    <Select value={current} onValueChange={(v) => onSetRole(userId, v as any)}>
      <SelectTrigger className="h-8 w-28 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">Usuário</SelectItem>
        <SelectItem value="moderator">Moderador</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface Column { key: string; label: string; render?: (value: any) => string; }

function AdminTable({ items, columns, renderStatus, actions }: {
  items: any[];
  columns: Column[];
  renderStatus: (item: any) => React.ReactNode;
  actions: (item: any) => React.ReactNode;
}) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">Nenhum registro encontrado.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-muted-foreground">{col.label}</th>
            ))}
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-card-foreground max-w-[200px] truncate">
                  {col.render ? col.render(item[col.key]) : (item[col.key] || "—")}
                </td>
              ))}
              <td className="px-4 py-3">{renderStatus(item)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">{actions(item)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
