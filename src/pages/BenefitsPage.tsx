import { motion } from "framer-motion";
import { Percent, Building2, Tag, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const benefitCategories = ["Tecnologia", "Alimentação", "Construção", "Saúde", "Serviços", "Indústria", "Educação", "Outro"];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface Benefit {
  id: string;
  user_id: string;
  offer: string;
  category: string;
  exclusive: boolean;
  company_name?: string;
}

export default function BenefitsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ offer: "", category: "Tecnologia", exclusive: false });

  const fetchData = async () => {
    const { data: items } = await supabase.from("benefits").select("*").eq("active", true).order("created_at", { ascending: false });
    if (!items) { setLoading(false); return; }

    const userIds = [...new Set(items.map((b: any) => b.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, company_name").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.company_name]));

    setBenefits(items.map((b: any) => ({ ...b, company_name: profileMap.get(b.user_id) || "Empresa" })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("benefits").insert({
      user_id: user.id,
      offer: form.offer,
      category: form.category,
      exclusive: form.exclusive,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Benefício criado!" });
      setForm({ offer: "", category: "Tecnologia", exclusive: false });
      setDialogOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("benefits").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold text-foreground">Clube de Benefícios</h1>
            <p className="text-muted-foreground">Descontos e condições exclusivas entre empresas associadas.</p>
          </div>
          {user && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="lg"><Plus className="mr-1 h-4 w-4" /> Criar Benefício</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo Benefício</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Oferta *</Label><Input value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} placeholder="Ex: 20% de desconto em consultoria" /></div>
                  <div><Label>Categoria *</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{benefitCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2"><Switch checked={form.exclusive} onCheckedChange={(v) => setForm({ ...form, exclusive: v })} /><Label>Exclusivo Premium</Label></div>
                  <Button onClick={handleSubmit} disabled={saving || !form.offer} className="w-full">{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Criar Benefício</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, i) => (
              <motion.div key={benefit.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="rounded-2xl border border-border bg-card p-6 card-shadow transition-all hover:card-shadow-hover hover:-translate-y-1">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                    <Percent className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    {benefit.exclusive && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Exclusivo Premium</span>}
                    {user?.id === benefit.user_id && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(benefit.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    )}
                  </div>
                </div>
                <h3 className="mb-1 text-base font-bold text-card-foreground">{benefit.offer}</h3>
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />{benefit.company_name}
                  <span className="ml-auto flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{benefit.category}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">Resgatar benefício</Button>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && benefits.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">Nenhum benefício disponível ainda.</div>
        )}
      </div>
    </div>
  );
}
