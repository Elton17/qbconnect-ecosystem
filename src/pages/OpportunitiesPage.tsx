import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Truck, Briefcase, Package, Calendar, Plus, Loader2, Trash2, Pencil, Handshake, TrendingUp, Zap, CheckCircle2, DollarSign } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useApprovedCompany } from "@/hooks/useApprovedCompany";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
  status?: string;
  interested_count?: number;
  closed_with?: string;
  deal_value?: number | null;
  closed_at?: string | null;
  deal_feedback?: string;
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { approved } = useApprovedCompany();
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", type: "fornecedor", value: "", description: "", urgent: false });

  // Close deal dialog
  const [closeDialog, setCloseDialog] = useState<{ open: boolean; opp: Opportunity | null }>({ open: false, opp: null });
  const [closeForm, setCloseForm] = useState({ closed_with: "", deal_value: "", deal_feedback: "" });
  const [closeSaving, setCloseSaving] = useState(false);

  const fetchData = async () => {
    // Fetch both active and closed opportunities
    const { data: opps } = await supabase
      .from("opportunities")
      .select("*")
      .or("active.eq.true,status.eq.closed")
      .order("created_at", { ascending: false });
    if (!opps) { setLoading(false); return; }

    const userIds = [...new Set(opps.map((o: any) => o.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, company_name, contact_phone, phone").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, { company_name: p.company_name, contact_phone: p.contact_phone || p.phone }]));

    const mapped = opps.map((o: any) => ({
      ...o,
      company_name: profileMap.get(o.user_id)?.company_name || "Empresa",
      contact_phone: profileMap.get(o.user_id)?.contact_phone || "",
    }));
    setAllOpportunities(mapped);
    setOpportunities(mapped.filter((o: any) => o.status !== "closed"));
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

  const handleInterest = async (opp: Opportunity) => {
    // Increment interested_count
    await supabase.from("opportunities").update({
      interested_count: (opp.interested_count || 0) + 1,
    }).eq("id", opp.id);

    // Open WhatsApp
    if (opp.contact_phone) {
      const cleanPhone = opp.contact_phone.replace(/\D/g, "");
      const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
      const message = encodeURIComponent(`Olá! Vi sua oportunidade *${opp.title}* no QBCAMP Conecta+ e tenho interesse em conversar. Podemos agendar?`);
      window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank");
    }

    // Update local state
    setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, interested_count: (o.interested_count || 0) + 1 } : o));
    setAllOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, interested_count: (o.interested_count || 0) + 1 } : o));
  };

  const handleCloseDeal = async () => {
    if (!closeDialog.opp) return;
    setCloseSaving(true);
    const { error } = await supabase.from("opportunities").update({
      status: "closed",
      active: false,
      closed_with: closeForm.closed_with,
      deal_value: closeForm.deal_value ? parseFloat(closeForm.deal_value) : null,
      deal_feedback: closeForm.deal_feedback,
      closed_at: new Date().toISOString(),
    }).eq("id", closeDialog.opp.id);
    setCloseSaving(false);
    if (error) {
      toast({ title: "Erro ao registrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Parabéns! Negócio registrado. A QBCAMP agradece por movimentar a economia da nossa região! 🤝" });
      setCloseDialog({ open: false, opp: null });
      setCloseForm({ closed_with: "", deal_value: "", deal_feedback: "" });
      fetchData();
    }
  };

  const filtered = useMemo(() => {
    const base = opportunities.filter((o) => {
      const matchType = activeType === "all" || o.type === activeType;
      const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) || (o.company_name || "").toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
    const shuffled = [...base];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [opportunities, activeType, search]);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Hoje";
    if (days === 1) return "Há 1 dia";
    return `Há ${days} dias`;
  };

  const urgentCount = opportunities.filter(o => o.urgent).length;
  const closedDeals = allOpportunities.filter(o => o.status === "closed");
  const totalDealValue = closedDeals.reduce((sum, o) => sum + (o.deal_value || 0), 0);

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
              { label: "Negócios Fechados", value: `${closedDeals.length}`, icon: CheckCircle2 },
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

      {/* Negócios Gerados Banner */}
      <section className="border-b border-border bg-muted/30 py-8">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-border bg-card p-6 text-center md:p-8">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Handshake className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-extrabold text-foreground md:text-2xl">Negócios Gerados pela QBCAMP</h2>
            {closedDeals.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
                <div>
                  <div className="text-3xl font-extrabold text-primary">{closedDeals.length}</div>
                  <div className="text-sm text-muted-foreground">negócios fechados</div>
                </div>
                {totalDealValue > 0 && (
                  <div>
                    <div className="text-3xl font-extrabold text-primary">
                      R$ {totalDealValue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </div>
                    <div className="text-sm text-muted-foreground">movimentados entre associados</div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">Seja o primeiro a fechar um negócio! 🚀</p>
            )}
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
            {filtered.map((opp, i) => {
              const isClosed = opp.status === "closed";
              const isOwner = user?.id === opp.user_id;
              return (
                <motion.div key={opp.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className={`group flex flex-col gap-4 rounded-2xl border bg-card p-6 card-shadow transition-all hover:card-shadow-hover hover:-translate-y-0.5 md:flex-row md:items-center md:justify-between ${isClosed ? "border-primary/30 opacity-80" : "border-border"}`}>
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[opp.type] || ""}`}>{types.find((t) => t.value === opp.type)?.label}</span>
                      {opp.urgent && !isClosed && <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive animate-pulse">🔥 Urgente</span>}
                      {isClosed && <Badge className="bg-primary/10 text-primary border-primary/20">🤝 Fechado</Badge>}
                      {!isClosed && (opp.interested_count || 0) > 0 && (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{opp.interested_count} interessado{(opp.interested_count || 0) > 1 ? "s" : ""}</span>
                      )}
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-card-foreground">{opp.title}</h3>
                    {opp.description && <p className="mb-1 text-sm text-muted-foreground line-clamp-2">{opp.description}</p>}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{opp.company_name}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{timeAgo(opp.created_at)}</span>
                    </div>
                    {isClosed && opp.closed_with && (
                      <p className="mt-1 text-xs text-primary font-medium">Fechado com: {opp.closed_with}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {opp.value && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">{opp.value}</div>
                        <div className="text-xs text-muted-foreground">Valor estimado</div>
                      </div>
                    )}
                    {!isClosed && (
                      <>
                        {/* Interest button — for logged-in approved users who are NOT the owner */}
                        {user && approved && !isOwner && opp.contact_phone && (
                          <Button
                            size="sm"
                            className="text-white"
                            style={{ backgroundColor: "#25D366" }}
                            onClick={() => handleInterest(opp)}
                          >
                            <WhatsAppIcon className="mr-1 h-3.5 w-3.5" /> Tenho Interesse
                          </Button>
                        )}
                        {/* Owner controls */}
                        {isOwner && (
                          <div className="flex gap-1">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setCloseDialog({ open: true, opp });
                                setCloseForm({ closed_with: "", deal_value: "", deal_feedback: "" });
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Marcar como Fechado
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(opp)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => confirmDelete(() => handleDelete(opp.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <Handshake className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhuma oportunidade encontrada.</p>
          </div>
        )}

        {/* Closed deals section */}
        {closedDeals.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-extrabold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Negócios Fechados Recentes
            </h2>
            <div className="space-y-3">
              {closedDeals.slice(0, 5).map((opp) => (
                <div key={opp.id} className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div>
                    <h4 className="font-bold text-foreground">{opp.title}</h4>
                    <p className="text-sm text-muted-foreground">{opp.company_name} → {opp.closed_with}</p>
                  </div>
                  {opp.deal_value && opp.deal_value > 0 && (
                    <div className="text-right">
                      <span className="font-bold text-primary">R$ {opp.deal_value.toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Close Deal Dialog */}
      <Dialog open={closeDialog.open} onOpenChange={(open) => { if (!open) setCloseDialog({ open: false, opp: null }); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Marcar Negócio como Fechado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Com qual empresa você fechou negócio? *</Label>
              <Input
                value={closeForm.closed_with}
                onChange={(e) => setCloseForm({ ...closeForm, closed_with: e.target.value })}
                placeholder="Nome da empresa parceira"
              />
            </div>
            <div>
              <Label>Valor estimado do negócio (opcional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  className="pl-9"
                  value={closeForm.deal_value}
                  onChange={(e) => setCloseForm({ ...closeForm, deal_value: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div>
              <Label>Como foi a experiência? (opcional)</Label>
              <Textarea
                value={closeForm.deal_feedback}
                onChange={(e) => setCloseForm({ ...closeForm, deal_feedback: e.target.value })}
                placeholder="Conte como foi o negócio..."
                rows={3}
              />
            </div>
            <Button
              onClick={handleCloseDeal}
              disabled={closeSaving || !closeForm.closed_with}
              className="w-full"
            >
              {closeSaving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
              Confirmar Fechamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {ConfirmDialog}
    </div>
  );
}
