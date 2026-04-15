import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2, User, Globe, Save, Loader2, Shield, Camera, Package, Handshake, Gift, CalendarDays, GraduationCap, Trash2, ExternalLink, Megaphone, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";
import { formatPhone, formatCNPJ as formatCNPJMask } from "@/lib/masks";



type Profile = Tables<"profiles">;

const segments = ["Tecnologia", "Saúde", "Educação", "Varejo", "Indústria", "Serviços", "Agronegócio", "Construção", "Logística", "Outro"];
const plans = [
  { value: "basic", label: "Básico", color: "secondary" as const },
  { value: "professional", label: "Profissional", color: "default" as const },
  { value: "enterprise", label: "Enterprise", color: "destructive" as const },
];

const formatCNPJ = formatCNPJMask;

// --- Meus Anúncios sub-component ---
function MeusAnuncios({ userId }: { userId: string }) {
  const { toast } = useToast();
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const [products, setProducts] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [prodRes, oppRes, benRes, evtRes, crsRes] = await Promise.all([
      supabase.from("products").select("id, title, category, price, active, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("opportunities").select("id, title, type, active, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("benefits").select("id, offer, category, active, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("events").select("id, title, category, start_date, active, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("courses").select("id, title, category, active, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    setProducts(prodRes.data || []);
    setOpportunities(oppRes.data || []);
    setBenefits(benRes.data || []);
    setEvents(evtRes.data || []);
    setCourses(crsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [userId]);

  const handleDelete = async (table: string, id: string, label: string) => {
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }); }
    else { toast({ title: `${label} removido!` }); fetchAll(); }
  };

  const handleToggleActive = async (table: string, id: string, currentActive: boolean, label: string) => {
    const { error } = await (supabase.from(table as any) as any).update({ active: !currentActive }).eq("id", id);
    if (error) { toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" }); }
    else { toast({ title: `${label} ${!currentActive ? "ativado" : "desativado"}!` }); fetchAll(); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const totalItems = products.length + opportunities.length + benefits.length + events.length + courses.length;

  const SectionHeader = ({ icon: Icon, title, count }: { icon: any; title: string; count: number }) => (
    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <Badge variant="secondary" className="ml-1 text-xs">{count}</Badge>
    </div>
  );

  const ItemRow = ({ id, title, subtitle, link, table, label, active }: { id: string; title: string; subtitle?: string; link: string; table: string; label: string; active?: boolean }) => (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 mb-2 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${active === false ? "text-muted-foreground line-through" : "text-foreground"}`}>{title}</span>
          {active === false && <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">Inativo</Badge>}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <Switch checked={active !== false} onCheckedChange={() => handleToggleActive(table, id, active !== false, label)} className="scale-90" />
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link to={link}><ExternalLink className="h-3.5 w-3.5" /></Link>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => confirmDelete(() => handleDelete(table, id, label))}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      {totalItems === 0 ? (
        <Card className="card-shadow">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-lg font-semibold text-foreground">Nenhum anúncio publicado</p>
            <p className="text-sm text-muted-foreground mt-1">Comece a divulgar seus produtos, serviços e oportunidades no marketplace.</p>
            <Button className="mt-4" asChild><Link to="/marketplace">Ir para o Marketplace</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Todos os seus anúncios</CardTitle>
            <CardDescription>{totalItems} publicação{totalItems !== 1 ? "ões" : ""} no total</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length > 0 && (
              <>
                <SectionHeader icon={Package} title="Produtos" count={products.length} />
                {products.map((p) => (
                  <ItemRow key={p.id} id={p.id} title={p.title} subtitle={`${p.category || "Sem categoria"} • R$ ${Number(p.price).toFixed(2)}`} link={`/produto/${p.id}`} table="products" label="Produto" active={p.active} />
                ))}
              </>
            )}

            {opportunities.length > 0 && (
              <>
                <SectionHeader icon={Handshake} title="Oportunidades" count={opportunities.length} />
                {opportunities.map((o) => (
                  <ItemRow key={o.id} id={o.id} title={o.title} subtitle={`${o.type} • ${formatDate(o.created_at)}`} link="/oportunidades" table="opportunities" label="Oportunidade" active={o.active} />
                ))}
              </>
            )}

            {benefits.length > 0 && (
              <>
                <SectionHeader icon={Gift} title="Benefícios" count={benefits.length} />
                {benefits.map((b) => (
                  <ItemRow key={b.id} id={b.id} title={b.offer} subtitle={`${b.category || "Sem categoria"} • ${formatDate(b.created_at)}`} link="/beneficios" table="benefits" label="Benefício" active={b.active} />
                ))}
              </>
            )}

            {events.length > 0 && (
              <>
                <SectionHeader icon={CalendarDays} title="Eventos" count={events.length} />
                {events.map((e) => (
                  <ItemRow key={e.id} id={e.id} title={e.title} subtitle={`${e.category} • ${formatDate(e.start_date)}`} link={`/evento/${e.id}`} table="events" label="Evento" active={e.active} />
                ))}
              </>
            )}

            {courses.length > 0 && (
              <>
                <SectionHeader icon={GraduationCap} title="Cursos" count={courses.length} />
                {courses.map((c) => (
                  <ItemRow key={c.id} id={c.id} title={c.title} subtitle={`${c.category} • ${formatDate(c.created_at)}`} link={`/curso/${c.id}`} table="courses" label="Curso" active={c.active} />
                ))}
              </>
            )}
          </CardContent>
        </Card>
      )}
      {ConfirmDialog}
    </div>
  );
}

// --- Main ProfilePage ---
export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    company_name: "", cnpj: "", segment: "", city: "", phone: "", email: "",
    website: "", address: "", description: "", contact_name: "", contact_role: "",
    contact_email: "", contact_phone: "", logo_url: "",
  });

  useEffect(() => { if (!authLoading && !user) navigate("/login"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    async function fetchProfile() {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      if (error) { toast({ title: "Erro ao carregar perfil", description: error.message, variant: "destructive" }); }
      else if (data) {
        setProfile(data);
        setForm({
          company_name: data.company_name || "", cnpj: data.cnpj || "", segment: data.segment || "",
          city: data.city || "", phone: data.phone || "", email: data.email || "", website: data.website || "",
          address: data.address || "", description: data.description || "", contact_name: data.contact_name || "",
          contact_role: data.contact_role || "", contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "", logo_url: data.logo_url || "",
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user, toast]);

  const handleChange = (field: string, value: string) => {
    if (field === "cnpj") value = formatCNPJ(value);
    if (field === "phone" || field === "contact_phone") value = formatPhone(value);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/logo.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("logos").upload(filePath, file, { upsert: true });
    if (uploadError) { toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(filePath);
    await supabase.from("profiles").update({ logo_url: publicUrl }).eq("user_id", user.id);
    setForm((prev) => ({ ...prev, logo_url: publicUrl }));
    toast({ title: "Logo atualizado!" });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      company_name: form.company_name, cnpj: form.cnpj, segment: form.segment, city: form.city,
      phone: form.phone, email: form.email, website: form.website, address: form.address,
      description: form.description, contact_name: form.contact_name, contact_role: form.contact_role,
      contact_email: form.contact_email, contact_phone: form.contact_phone,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Perfil atualizado!", description: "Suas alterações foram salvas com sucesso." }); }
  };

  if (authLoading || loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const currentPlan = plans.find((p) => p.value === profile?.plan) || plans[0];

  return (
    <div>
      {/* Profile Header */}
      <section className="relative overflow-hidden bg-secondary py-10 md:py-14">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-1/3 -top-10 h-64 w-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-10 left-1/4 h-48 w-48 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-20 w-20 border-2 border-secondary-foreground/10">
                  {form.logo_url ? <AvatarImage src={form.logo_url} alt="Logo da empresa" /> : null}
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl"><Building2 className="h-10 w-10" /></AvatarFallback>
                </Avatar>
                <label htmlFor="logo-upload" className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-foreground/60 text-background opacity-0 transition-opacity group-hover:opacity-100">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </label>
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-secondary-foreground">{form.company_name || "Meu Perfil"}</h1>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-0">{currentPlan.label}</Badge>
                  {profile?.approved ? (
                    <Badge variant="outline" className="border-primary/30 text-primary"><Shield className="mr-1 h-3 w-3" /> Aprovada</Badge>
                  ) : (
                    <Badge variant="outline" className="border-destructive/30 text-destructive">Pendente de aprovação</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} size="lg" variant="hero">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar alterações
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container max-w-4xl py-8">
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="company" className="gap-1.5"><Building2 className="h-4 w-4" /> Empresa</TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5"><User className="h-4 w-4" /> Contato</TabsTrigger>
            <TabsTrigger value="details" className="gap-1.5"><Globe className="h-4 w-4" /> Detalhes</TabsTrigger>
            <TabsTrigger value="listings" className="gap-1.5"><Megaphone className="h-4 w-4" /> Meus Anúncios</TabsTrigger>
            
          </TabsList>

          <TabsContent value="company">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Dados da Empresa</CardTitle>
                <CardDescription>Informações principais do seu negócio.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="company_name">Razão Social</Label><Input id="company_name" value={form.company_name} onChange={(e) => handleChange("company_name", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="cnpj">CNPJ</Label><Input id="cnpj" value={form.cnpj} onChange={(e) => handleChange("cnpj", e.target.value)} placeholder="00.000.000/0000-00" /></div>
                <div className="space-y-2"><Label htmlFor="segment">Segmento</Label>
                  <Select value={form.segment} onValueChange={(v) => handleChange("segment", v)}>
                    <SelectTrigger id="segment"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{segments.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="email">E-mail corporativo</Label><Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="phone">Telefone</Label><Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="city">Cidade</Label>
                  <Select value={form.city} onValueChange={(v) => handleChange("city", v)}>
                    <SelectTrigger id="city"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{["Quatro Barras", "Campina Grande do Sul", "Colombo", "Pinhais", "Curitiba"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card className="card-shadow">
              <CardHeader><CardTitle className="text-lg">Responsável</CardTitle><CardDescription>Dados do contato principal da empresa.</CardDescription></CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="contact_name">Nome</Label><Input id="contact_name" value={form.contact_name} onChange={(e) => handleChange("contact_name", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="contact_role">Cargo</Label><Input id="contact_role" value={form.contact_role} onChange={(e) => handleChange("contact_role", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="contact_email">E-mail</Label><Input id="contact_email" type="email" value={form.contact_email} onChange={(e) => handleChange("contact_email", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="contact_phone">Telefone</Label><Input id="contact_phone" value={form.contact_phone} onChange={(e) => handleChange("contact_phone", e.target.value)} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card className="card-shadow">
              <CardHeader><CardTitle className="text-lg">Informações Adicionais</CardTitle><CardDescription>Detalhes complementares do perfil.</CardDescription></CardHeader>
              <CardContent className="grid gap-6">
                <div className="space-y-2"><Label htmlFor="address">Endereço completo</Label><Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" value={form.website || ""} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://" /></div>
                <div className="space-y-2"><Label htmlFor="description">Descrição da empresa</Label><Textarea id="description" rows={4} value={form.description || ""} onChange={(e) => handleChange("description", e.target.value)} placeholder="Conte um pouco sobre sua empresa..." /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            {user && <MeusAnuncios userId={user.id} />}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
