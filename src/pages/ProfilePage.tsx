import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, User, Phone, Globe, MapPin, Save, Loader2, Shield } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const segments = [
  "Tecnologia", "Saúde", "Educação", "Varejo", "Indústria",
  "Serviços", "Agronegócio", "Construção", "Logística", "Outro",
];

const plans = [
  { value: "basic", label: "Básico", color: "secondary" as const },
  { value: "professional", label: "Profissional", color: "default" as const },
  { value: "enterprise", label: "Enterprise", color: "destructive" as const },
];

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    cnpj: "",
    segment: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    description: "",
    contact_name: "",
    contact_role: "",
    contact_email: "",
    contact_phone: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (error) {
        toast({ title: "Erro ao carregar perfil", description: error.message, variant: "destructive" });
      } else if (data) {
        setProfile(data);
        setForm({
          company_name: data.company_name || "",
          cnpj: data.cnpj || "",
          segment: data.segment || "",
          city: data.city || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          address: data.address || "",
          description: data.description || "",
          contact_name: data.contact_name || "",
          contact_role: data.contact_role || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user, toast]);

  const handleChange = (field: string, value: string) => {
    if (field === "cnpj") value = formatCNPJ(value);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: form.company_name,
        cnpj: form.cnpj,
        segment: form.segment,
        city: form.city,
        phone: form.phone,
        email: form.email,
        website: form.website,
        address: form.address,
        description: form.description,
        contact_name: form.contact_name,
        contact_role: form.contact_role,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!", description: "Suas alterações foram salvas com sucesso." });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.value === profile?.plan) || plans[0];

  return (
    <div className="container max-w-4xl py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {form.company_name || "Meu Perfil"}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={currentPlan.color}>{currentPlan.label}</Badge>
              {profile?.approved ? (
                <Badge variant="outline" className="border-green-500/30 text-green-600">
                  <Shield className="mr-1 h-3 w-3" /> Aprovada
                </Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-600">
                  Pendente de aprovação
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar alterações
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="company" className="gap-1.5">
            <Building2 className="h-4 w-4" /> Empresa
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5">
            <User className="h-4 w-4" /> Contato
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-1.5">
            <Globe className="h-4 w-4" /> Detalhes
          </TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados da Empresa</CardTitle>
              <CardDescription>Informações principais do seu negócio.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Razão Social</Label>
                <Input id="company_name" value={form.company_name} onChange={(e) => handleChange("company_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" value={form.cnpj} onChange={(e) => handleChange("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segment">Segmento</Label>
                <Select value={form.segment} onValueChange={(v) => handleChange("segment", v)}>
                  <SelectTrigger id="segment"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {segments.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Responsável</CardTitle>
              <CardDescription>Dados do contato principal da empresa.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Nome</Label>
                <Input id="contact_name" value={form.contact_name} onChange={(e) => handleChange("contact_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_role">Cargo</Label>
                <Input id="contact_role" value={form.contact_role} onChange={(e) => handleChange("contact_role", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">E-mail</Label>
                <Input id="contact_email" type="email" value={form.contact_email} onChange={(e) => handleChange("contact_email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Telefone</Label>
                <Input id="contact_phone" value={form.contact_phone} onChange={(e) => handleChange("contact_phone", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Adicionais</CardTitle>
              <CardDescription>Detalhes complementares do perfil.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="address">Endereço completo</Label>
                <Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={form.website || ""} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição da empresa</Label>
                <Textarea id="description" rows={4} value={form.description || ""} onChange={(e) => handleChange("description", e.target.value)} placeholder="Conte um pouco sobre sua empresa..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
