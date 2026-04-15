import { useState, useEffect, useCallback, useRef } from "react";
import { Flame, Plus, Loader2, Trash2, Clock, Percent, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const promoCategories = ["Produtos", "Serviços", "Alimentação", "Tecnologia", "Vestuário", "Saúde", "Educação", "Outro"];

interface Promotion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  discount_percent: number;
  original_price: number | null;
  promo_price: number | null;
  category: string;
  image_url: string;
  expires_at: string;
  company_name?: string;
}

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expirada";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

interface Props {
  /** Compact mode for landing page (smaller height) */
  compact?: boolean;
}

export default function PromotionsSection({ compact = false }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", discount_percent: "10",
    original_price: "", promo_price: "", category: "Produtos",
    expires_at: "",
  });

  const fetchPromotions = async () => {
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .eq("active", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (!data) { setLoading(false); return; }
    const userIds = [...new Set(data.map((p: any) => p.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, company_name").in("user_id", userIds);
    const map = new Map((profiles || []).map((p: any) => [p.user_id, p.company_name]));
    setPromotions(data.map((p: any) => ({ ...p, company_name: map.get(p.user_id) || "Empresa" })));
    setLoading(false);
  };

  useEffect(() => { fetchPromotions(); }, []);

  // Auto-play
  const next = useCallback(() => {
    setCurrent(c => (c + 1) % Math.max(promotions.length, 1));
  }, [promotions.length]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + promotions.length) % Math.max(promotions.length, 1));
  }, [promotions.length]);

  useEffect(() => {
    if (paused || promotions.length <= 1) return;
    intervalRef.current = setInterval(next, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, promotions.length, next]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.title || !form.expires_at) {
      toast({ title: "Preencha título e data de validade", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("promotions").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      discount_percent: parseInt(form.discount_percent) || 10,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      promo_price: form.promo_price ? parseFloat(form.promo_price) : null,
      category: form.category,
      expires_at: new Date(form.expires_at).toISOString(),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Promoção criada!" });
      setForm({ title: "", description: "", discount_percent: "10", original_price: "", promo_price: "", category: "Produtos", expires_at: "" });
      setDialogOpen(false);
      fetchPromotions();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("promotions").delete().eq("id", id);
    toast({ title: "Promoção removida" });
    fetchPromotions();
  };

  if (loading) {
    return (
      <section className="border-b border-border py-6">
        <div className="container flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (promotions.length === 0) {
    return (
      <section className="border-b border-border py-6">
        <div className="container">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-bold text-foreground">Promoções & Ofertas</h2>
            </div>
            {user && (
              <Button variant="default" size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Nova Promoção
              </Button>
            )}
          </div>
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-10 text-center">
            <Flame className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhuma promoção ativa no momento.</p>
          </div>
          {renderDialog()}
        </div>
      </section>
    );
  }

  const promo = promotions[current];
  const bannerH = compact ? "h-[200px] sm:h-[260px]" : "h-[220px] sm:h-[300px] lg:h-[340px]";

  function renderDialog() {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" /> Nova Promoção
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Título da oferta *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: 30% de desconto em manutenção" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Descrição</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes da promoção" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Desconto (%) *</label>
                <Input type="number" min="1" max="99" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Categoria</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{promoCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Preço original (R$)</label>
                <Input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} placeholder="0,00" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Preço promocional (R$)</label>
                <Input type="number" step="0.01" value={form.promo_price} onChange={(e) => setForm({ ...form, promo_price: e.target.value })} placeholder="0,00" />
              </div>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-foreground">
                <Calendar className="h-3.5 w-3.5" /> Válido até *
              </label>
              <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <Button onClick={handleSubmit} disabled={saving || !form.title || !form.expires_at} className="w-full">
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Flame className="mr-1 h-4 w-4" />}
              Publicar Promoção
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <section className="border-b border-border py-6 sm:py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-destructive/10">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Promoções & Ofertas</h2>
          </div>
          <div className="flex items-center gap-2">
            {user && !compact && (
              <Button variant="default" size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Nova Promoção</span><span className="sm:hidden">Nova</span>
              </Button>
            )}
          </div>
        </div>

        {/* Carousel Banner */}
        <div
          className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${bannerH}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setTimeout(() => setPaused(false), 3000)}
        >
          {/* Slides container */}
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {promotions.map((p) => (
              <div key={p.id} className="relative h-full w-full flex-shrink-0">
                {/* Background image */}
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-destructive/80 to-primary/60" />
                )}
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />

                {/* Content */}
                <div className="relative z-10 flex h-full items-center px-5 sm:px-10 lg:px-14">
                  <div className="max-w-lg">
                    {/* Discount badge */}
                    <div className="mb-2 sm:mb-3 inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1 sm:px-4 sm:py-1.5 text-destructive-foreground shadow-lg">
                      <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-sm sm:text-base font-extrabold">-{p.discount_percent}% OFF</span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight line-clamp-2">
                      {p.title}
                    </h3>

                    {/* Description */}
                    {p.description && (
                      <p className="mb-2 sm:mb-3 text-sm sm:text-base text-white/80 line-clamp-2">
                        {p.description}
                      </p>
                    )}

                    {/* Price */}
                    {(p.original_price || p.promo_price) && (
                      <div className="mb-2 sm:mb-3 flex items-center gap-3">
                        {p.original_price && (
                          <span className="text-base sm:text-lg text-white/50 line-through">
                            R$ {p.original_price.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                        {p.promo_price != null && p.promo_price > 0 && (
                          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                            R$ {p.promo_price.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                        {p.promo_price === 0 && (
                          <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">GRÁTIS</span>
                        )}
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {timeLeft(p.expires_at)}
                      </span>
                      <span>por {p.company_name}</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-white/70">
                        {p.category}
                      </span>
                    </div>

                    {/* Owner delete */}
                    {user?.id === p.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-white/60 hover:text-destructive hover:bg-white/10"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Nav arrows */}
          {promotions.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {promotions.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
              {promotions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 sm:w-8 bg-white"
                      : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {renderDialog()}
    </section>
  );
}
