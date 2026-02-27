import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Flame, Plus, Loader2, Trash2, Clock, Percent, Calendar, Tag } from "lucide-react";
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expirada";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h restantes`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m restantes`;
}

export default function PromotionsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
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
      <section className="border-b border-border py-10">
        <div className="container flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border py-10">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <Flame className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground md:text-2xl">
                Promoções & Ofertas
              </h2>
              <p className="text-sm text-muted-foreground">
                Ofertas com tempo limitado dos associados
              </p>
            </div>
          </div>
          {user && (
            <Button variant="default" size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nova Promoção
            </Button>
          )}
        </div>

        {promotions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center">
            <Flame className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhuma promoção ativa no momento.</p>
            {user && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Criar primeira promoção
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {promotions.map((promo, i) => (
              <motion.div
                key={promo.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="group relative overflow-hidden rounded-2xl border border-destructive/20 bg-card card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
              >
                {/* Discount badge */}
                <div className="absolute right-3 top-3 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-destructive shadow-lg">
                  <span className="text-lg font-extrabold text-destructive-foreground">
                    -{promo.discount_percent}%
                  </span>
                </div>

                {/* Image or gradient placeholder */}
                {promo.image_url ? (
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    <img src={promo.image_url} alt={promo.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-destructive/10 to-primary/10">
                    <Percent className="h-12 w-12 text-destructive/30" />
                  </div>
                )}

                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                      {promo.category || "Geral"}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {timeLeft(promo.expires_at)}
                    </span>
                  </div>

                  <h3 className="mb-1 text-base font-bold text-card-foreground line-clamp-2">{promo.title}</h3>
                  {promo.description && (
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{promo.description}</p>
                  )}

                  {/* Price display */}
                  {(promo.original_price || promo.promo_price) && (
                    <div className="mb-3 flex items-center gap-2">
                      {promo.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          R$ {promo.original_price.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                      {promo.promo_price && (
                        <span className="text-lg font-extrabold text-destructive">
                          R$ {promo.promo_price.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">por {promo.company_name}</p>

                  {user?.id === promo.user_id && (
                    <div className="mt-3 border-t border-border pt-3">
                      <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive" onClick={() => handleDelete(promo.id)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Promotion Dialog */}
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
      </div>
    </section>
  );
}
