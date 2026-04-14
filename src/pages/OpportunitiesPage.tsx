import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Users, Truck, Briefcase, Package, ArrowRight, Calendar, Plus, Loader2, Trash2, Pencil, Handshake, TrendingUp, Zap, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useApprovedCompany } from "@/hooks/useApprovedCompany";

const types = [
  { label: "Todos", value: "all" },
  { label: "Procuro Fornecedor", value: "fornecedor", icon: Truck },
  { label: "Procuro Parceiro", value: "parceiro", icon: Users },
  { label: "Estou Contratando", value: "contratando", icon: Briefcase },
  { label: "Venda de Estoque", value: "estoque", icon: Package },
];

const typeColors: Record<string, string> = {
  fornecedor: "bg-primary/10 text-primary",
  parceiro: "bg-accent/20 text-accent-foreground",
  contratando: "bg-secondary/30 text-secondary-foreground",
  estoque: "bg-destructive/10 text-destructive",
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface Opportunity {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  value: string;
  urgent: boolean;
  created_at: string;
  company_name?: string;
  contact_phone?: string;
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { approved } = useApprovedCompany();
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", type: "fornecedor", value: "", description: "", urgent: false });

  const fetchData = async () => {
    const { data: opps } = await supabase.from("opportunities").select("*").eq("active", true).order("created_at", { ascending: false });
    if (!opps) { setLoading(false); return; }

    const userIds = [...new Set(opps.map((o: any) => o.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, company_name, contact_phone, phone").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, { company_name: p.company_name, contact_phone: p.contact_phone || p.phone }]));

    setOpportunities(opps.map((o: any) => ({
      ...o,
      company_name: profileMap.get(o.user_id)?.company_name || "Empresa",
      contact_phone: profileMap.get(o.user_id)?.contact_phone || "",
    })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from("opportunities").update({
        title: form.title, type: form.type, value: form.value, description: form.description, urgent: form.urgent,
      }).eq("id", editingId);
      setSaving(false);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Oportunidade atualizada!" }); resetForm(); fetchData(); }
    } else {
      const { error } = await supabase.from("opportunities").insert({
        user_id: user.id, title: form.title, type: form.type, value: form.value, description: form.description, urgent: form.urgent,
      });
      setSaving(false);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Oportunidade publicada!" }); resetForm(); fetchData(); }
    }
  };

  const resetForm = () => {
    setForm({ title: "", type: "fornecedor", value: "", description: "", urgent: false });
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleEdit = (opp: Opportunity) => {
    setEditingId(opp.id);
    setForm({ title: opp.title, type: opp.type, value: opp.value, description: opp.description, urgent: opp.urgent });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("opportunities").delete().eq("id", id);
    toast({ title: "Oportunidade removida!" });
    fetchData();
  };

  const filtered = opportunities.filter((o) => {
    const matchType = activeType === "all" || o.type === activeType;
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) || (o.company_name || "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Hoje";
    if (days === 1) return "Há 1 dia";
    return `Há ${days} dias`;
  };

  const urgentCount = opportunities.filter(o => o.urgent).length;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-16 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-64 w-64 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <Handshake className="h-4 w-4" /> Matchmaking Empresarial
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl">
              Encontre o <span className="text-gradient">parceiro ideal</span> para seu negócio
            </h1>
            <p className="mb-8 text-lg text-secondary-foreground/70">
              Conecte-se com fornecedores, parceiros e oportunidades de negócios da região.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user && approved && (
              <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="xl" onClick={() => { setEditingId(null); setForm({ title: "", type: "fornecedor", value: "", description: "", urgent: false }); }}><Plus className="mr-1 h-5 w-5" /> Publicar Oportunidade</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingId ? "Editar Oportunidade" : "Nova Oportunidade"}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Procuro fornecedor de aço" /></div>
                      <div><Label>Tipo *</Label>
                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{types.filter(t => t.value !== "all").map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Valor estimado</Label><Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="R$ 10.000" /></div>
                      <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                      <div className="flex items-center gap-2"><Switch checked={form.urgent} onCheckedChange={(v) => setForm({ ...form, urgent: v })} /><Label>Urgente</Label></div>
                      <Button onClick={handleSubmit} disabled={saving || !form.title} className="w-full">{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Publicar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              { label: "Oportunidades Ativas", value: `${opportunities.length}`, icon: TrendingUp },
              { label: "Urgentes", value: `${urgentCount}`, icon: Zap },
              { label: "Tipos", value: "4", icon: Briefcase },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 px-5 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-secondary-foreground">{stat.value}</div>
                  <div className="text-xs text-secondary-foreground/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container py-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar oportunidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {types.map((t) => (
            <button key={t.value} onClick={() => setActiveType(t.value)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeType === t.value ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {filtered.map((opp, i) => (
              <motion.div key={opp.id} custom={i} initial="hidden" animate="visible" variants={fadeInUp} className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 card-shadow transition-all hover:card-shadow-hover md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[opp.type] || ""}`}>{types.find((t) => t.value === opp.type)?.label}</span>
                    {opp.urgent && <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive animate-pulse">🔥 Urgente</span>}
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-card-foreground">{opp.title}</h3>
                  {opp.description && <p className="mb-1 text-sm text-muted-foreground line-clamp-2">{opp.description}</p>}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{opp.company_name}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{timeAgo(opp.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {opp.value && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{opp.value}</div>
                      <div className="text-xs text-muted-foreground">Valor estimado</div>
                    </div>
                  )}
                  {opp.contact_phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://wa.me/55${opp.contact_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Vi sua oportunidade "${opp.title}" na plataforma QBCAMP Conecta+ e gostaria de conversar.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-1 h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </Button>
                  )}
                  {user?.id === opp.user_id ? (
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(opp)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(opp.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ) : (
                    <Button variant="default" size="sm">Candidatar-se <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <Handshake className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhuma oportunidade encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
