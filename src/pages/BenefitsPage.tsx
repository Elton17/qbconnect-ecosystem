import { motion } from "framer-motion";
import { Percent, Building2, Tag, Plus, Loader2, Trash2, Pencil, Copy, Check, Ticket, Gift, Sparkles, MessageCircle, CalendarDays, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useApprovedCompany } from "@/hooks/useApprovedCompany";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import PlanUpgradeModal from "@/components/PlanUpgradeModal";
import PremiumBadge from "@/components/PremiumBadge";
import { usePlanLimits } from "@/hooks/usePlanLimits";

const benefitCategories = ["Tecnologia", "Alimentação", "Construção", "Saúde", "Serviços", "Indústria", "Educação", "Outro"];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "QB-";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

interface Benefit {
  id: string;
  user_id: string;
  offer: string;
  category: string;
  exclusive: boolean;
  whatsapp: string;
  expires_at: string | null;
  company_name?: string;
  logo_url?: string;
  plan?: string;
}

interface Redemption {
  benefit_id: string;
  code: string;
}

export default function BenefitsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { approved } = useApprovedCompany();
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const planLimitsData = usePlanLimits();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ offer: "", category: "Tecnologia", exclusive: false, whatsapp: "", expires_at: null as Date | null });
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [redeemingBenefit, setRedeemingBenefit] = useState<Benefit | null>(null);
  const [redeemCode, setRedeemCode] = useState<string | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userRedemptions, setUserRedemptions] = useState<Map<string, string>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const fetchData = async () => {
    const { data: items } = await supabase.from("benefits").select("*").eq("active", true).order("created_at", { ascending: false });
    if (!items) { setLoading(false); return; }
    const userIds = [...new Set(items.map((b: any) => b.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, company_name, logo_url, plan").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, { company_name: p.company_name, logo_url: p.logo_url, plan: p.plan }]));
    setBenefits(items.map((b: any) => ({ ...b, company_name: profileMap.get(b.user_id)?.company_name || "Empresa", logo_url: profileMap.get(b.user_id)?.logo_url || "", plan: profileMap.get(b.user_id)?.plan || "basic" })));
    if (user) {
      const { data: redemptions } = await supabase.from("redemptions").select("benefit_id, code").eq("user_id", user.id);
      if (redemptions) setUserRedemptions(new Map(redemptions.map((r: any) => [r.benefit_id, r.code])));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from("benefits").update({ offer: form.offer, category: form.category, exclusive: form.exclusive, whatsapp: form.whatsapp, expires_at: form.expires_at?.toISOString() || null }).eq("id", editingId);
      setSaving(false);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Benefício atualizado!" }); resetForm(); fetchData(); }
    } else {
      const { error } = await supabase.from("benefits").insert({ user_id: user.id, offer: form.offer, category: form.category, exclusive: form.exclusive, whatsapp: form.whatsapp, expires_at: form.expires_at?.toISOString() || null });
      setSaving(false);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Benefício criado!" }); resetForm(); fetchData(); }
    }
  };

  const resetForm = () => {
    setForm({ offer: "", category: "Tecnologia", exclusive: false, whatsapp: "", expires_at: null });
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleEdit = (benefit: Benefit) => {
    setEditingId(benefit.id);
    setForm({ offer: benefit.offer, category: benefit.category, exclusive: benefit.exclusive, whatsapp: benefit.whatsapp || "", expires_at: benefit.expires_at ? new Date(benefit.expires_at) : null });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => { await supabase.from("benefits").delete().eq("id", id); toast({ title: "Benefício removido!" }); fetchData(); };

  const handleRedeem = async (benefit: Benefit) => {
    if (!user) { toast({ title: "Faça login", description: "Você precisa estar logado para resgatar benefícios.", variant: "destructive" }); return; }
    setRedeemingBenefit(benefit); setRedeemDialogOpen(true); setCopied(false);
    const existingCode = userRedemptions.get(benefit.id);
    if (existingCode) { setRedeemCode(existingCode); return; }
    setRedeemLoading(true);
    const code = generateCode();
    const { error } = await supabase.from("redemptions").insert({ user_id: user.id, benefit_id: benefit.id, code });
    if (error) {
      if (error.code === "23505") {
        const { data } = await supabase.from("redemptions").select("code").eq("user_id", user.id).eq("benefit_id", benefit.id).single();
        setRedeemCode(data?.code || code);
      } else { toast({ title: "Erro", description: error.message, variant: "destructive" }); setRedeemDialogOpen(false); }
    } else { setRedeemCode(code); setUserRedemptions(new Map(userRedemptions).set(benefit.id, code)); }
    setRedeemLoading(false);
  };

  const handleCopy = () => { if (redeemCode) { navigator.clipboard.writeText(redeemCode); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  const exclusiveCount = benefits.filter(b => b.exclusive).length;
  const catFiltered = selectedCategory === "Todas" ? benefits : benefits.filter(b => b.category === selectedCategory);
  const searchFiltered = searchTerm.trim()
    ? catFiltered.filter(b => {
        const q = searchTerm.toLowerCase();
        return b.offer.toLowerCase().includes(q) || b.company_name?.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q);
      })
    : catFiltered;
  // Premium first
  const filteredBenefits = [...searchFiltered].sort((a, b) => (a.plan === "premium" ? -1 : 0) - (b.plan === "premium" ? -1 : 0));
  const activeCategories = ["Todas", ...new Set(benefits.map(b => b.category).filter(Boolean))];

  // Non-authenticated users see a CTA to join
  if (!user) {
    return (
      <div>
        <section className="relative overflow-hidden bg-secondary py-20 md:py-28">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -left-10 top-1/4 h-72 w-72 rounded-full bg-accent blur-3xl" />
            <div className="absolute -bottom-10 right-1/4 h-64 w-64 rounded-full bg-primary blur-3xl" />
          </div>
          <div className="container relative">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
                <Gift className="h-4 w-4" /> Exclusivo para Associados
              </div>
              <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl">
                Clube de <span className="text-gradient">Benefícios</span>
              </h1>
              <p className="mb-4 text-lg text-secondary-foreground/70">
                Descontos e condições exclusivas entre empresas associadas da QBCAMP.
              </p>
              <p className="mb-8 text-base text-secondary-foreground/60">
                Filie-se à QBCAMP e tenha acesso a benefícios exclusivos, descontos especiais e uma rede de parceiros que impulsiona o seu negócio.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button variant="hero" size="xl" asChild>
                  <a href="https://qbcamp.com.br/filiacao" target="_blank" rel="noopener noreferrer">
                    <Building2 className="mr-1.5 h-5 w-5" /> Quero me associar
                  </a>
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = "/login"}>
                  Já sou associado — Entrar
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                { icon: Percent, title: "Descontos Exclusivos", desc: "Condições especiais entre associados" },
                { icon: Ticket, title: "Cupons Únicos", desc: "Resgate e use quando quiser" },
                { icon: Sparkles, title: "Benefícios Premium", desc: "Ofertas especiais para planos Premium" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-5 text-center backdrop-blur-sm">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-secondary-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs text-secondary-foreground/60">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-16 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-10 top-1/4 h-72 w-72 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 h-64 w-64 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <Gift className="h-4 w-4" /> Clube Exclusivo
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl">
              Clube de <span className="text-gradient">Benefícios</span>
            </h1>
            <p className="mb-8 text-lg text-secondary-foreground/70">
              Descontos e condições exclusivas entre empresas associadas da QBCAMP.
            </p>
            {user && approved && (
              <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="xl" onClick={() => {
                    if (!planLimitsData.canAddBenefit) { setUpgradeOpen(true); return; }
                    setEditingId(null); setForm({ offer: "", category: "Tecnologia", exclusive: false, whatsapp: "", expires_at: null });
                  }}><Plus className="mr-1 h-5 w-5" /> Criar Benefício</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingId ? "Editar Benefício" : "Novo Benefício"}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Oferta *</Label><Input value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} placeholder="Ex: 20% de desconto em consultoria" /></div>
                    <div><Label>Categoria *</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{benefitCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2"><Switch checked={form.exclusive} onCheckedChange={(v) => setForm({ ...form, exclusive: v })} /><Label>Exclusivo Premium</Label></div>
                    <div>
                      <Label>Validade</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.expires_at && "text-muted-foreground")}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {form.expires_at ? format(form.expires_at, "dd/MM/yyyy", { locale: ptBR }) : "Sem validade (permanente)"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={form.expires_at || undefined} onSelect={(d) => setForm({ ...form, expires_at: d || null })} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                        </PopoverContent>
                      </Popover>
                      {form.expires_at && <Button variant="ghost" size="sm" className="mt-1 h-auto p-0 text-xs text-muted-foreground" onClick={() => setForm({ ...form, expires_at: null })}>Remover validade</Button>}
                    </div>
                    <div><Label>WhatsApp da empresa</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="Ex: 5541999999999" /></div>
                    <Button onClick={handleSubmit} disabled={saving || !form.offer} className="w-full">{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}{editingId ? "Salvar" : "Criar Benefício"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              { label: "Benefícios Ativos", value: `${benefits.length}`, icon: Percent },
              { label: "Exclusivos Premium", value: `${exclusiveCount}`, icon: Sparkles },
              { label: "Categorias", value: `${benefitCategories.length}`, icon: Tag },
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
      <div className="container py-10">
        {/* Category Filter */}
        {!loading && benefits.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar benefício, empresa ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {activeCategories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full"
                >
                  {cat === "Todas" && <Tag className="mr-1.5 h-3.5 w-3.5" />}
                  {cat}
                  {cat === "Todas" ? ` (${benefits.length})` : ` (${benefits.filter(b => b.category === cat).length})`}
                </Button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBenefits.map((benefit, i) => {
              const alreadyRedeemed = userRedemptions.has(benefit.id);
              const isExpired = benefit.expires_at && new Date(benefit.expires_at) < new Date();
              const expiresFormatted = benefit.expires_at ? format(new Date(benefit.expires_at), "dd/MM/yyyy", { locale: ptBR }) : null;
              return (
                <motion.div key={benefit.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="rounded-2xl border border-border bg-card p-6 card-shadow transition-all hover:card-shadow-hover hover:-translate-y-1">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 overflow-hidden">
                      {benefit.logo_url ? (
                        <img src={benefit.logo_url} alt={benefit.company_name} className="h-full w-full object-contain" />
                      ) : (
                        <Percent className="h-6 w-6 text-accent-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {benefit.exclusive && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Exclusivo Premium</span>}
                      {user?.id === benefit.user_id && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(benefit)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => confirmDelete(() => handleDelete(benefit.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="mb-1 text-base font-bold text-card-foreground">{benefit.offer}</h3>
                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />{benefit.company_name}
                    <span className="ml-auto flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{benefit.category}</span>
                  </div>
                  {expiresFormatted && (
                    <div className={cn("mb-3 flex items-center gap-1.5 text-xs", isExpired ? "text-destructive" : "text-muted-foreground")}>
                      <CalendarDays className="h-3.5 w-3.5" />
                      {isExpired ? "Expirado em " : "Válido até "}{expiresFormatted}
                    </div>
                  )}
                  <Button variant={alreadyRedeemed ? "secondary" : "outline"} size="sm" className="w-full" onClick={() => handleRedeem(benefit)} disabled={!!isExpired}>
                    <Ticket className="mr-1.5 h-3.5 w-3.5" />
                    {isExpired ? "Expirado" : alreadyRedeemed ? "Ver meu cupom" : "Resgatar benefício"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && benefits.length > 0 && filteredBenefits.length === 0 && (
          <div className="py-16 text-center">
            <Tag className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum benefício nesta categoria.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setSelectedCategory("Todas")}>Ver todos</Button>
          </div>
        )}

        {!loading && benefits.length === 0 && (
          <div className="py-16 text-center">
            <Gift className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum benefício disponível ainda.</p>
          </div>
        )}

        {/* Redeem Dialog */}
        <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Cupom de Benefício</DialogTitle>
              <DialogDescription>Apresente este código à empresa para validar seu desconto.</DialogDescription>
            </DialogHeader>
            {redeemLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : redeemCode ? (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                  <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Seu código</p>
                  <p className="text-2xl font-mono font-bold tracking-widest text-primary">{redeemCode}</p>
                </div>
                {redeemingBenefit && (
                  <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{redeemingBenefit.offer}</p>
                    <p className="mt-0.5 text-xs">por {redeemingBenefit.company_name}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" className="flex-1">
                    {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
                    {copied ? "Copiado!" : "Copiar código"}
                  </Button>
                  {redeemingBenefit?.whatsapp && (
                    <Button
                      variant="default"
                      className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white"
                      onClick={() => {
                        const phone = redeemingBenefit.whatsapp.replace(/\D/g, "");
                        const text = encodeURIComponent(`Olá! Gostaria de utilizar meu cupom de benefício QBCAMP.\n\n🎟️ Código: ${redeemCode}\n📋 Oferta: ${redeemingBenefit.offer}`);
                        window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
                      }}
                    >
                      <MessageCircle className="mr-1.5 h-4 w-4" /> Enviar via WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
      {ConfirmDialog}
    </div>
  );
}
