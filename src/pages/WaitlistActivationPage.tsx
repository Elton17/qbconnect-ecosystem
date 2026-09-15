import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Building2, CheckCircle2, ImagePlus, Loader2, Lock, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PasswordInput } from "@/components/ui/password-input";
import { formatCEP, formatCNPJ, formatPhone } from "@/lib/masks";
import { toast } from "sonner";

const schema = z.object({
  companyName: z.string().trim().min(2),
  cnpj: z.string().trim().min(14),
  segment: z.string().trim().min(1),
  city: z.string().trim().min(2),
  state: z.string().trim().length(2),
  phone: z.string().trim().min(8),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string().min(8),
  website: z.string().trim().max(200),
  description: z.string().trim().min(10).max(1000),
  address: z.string().trim().min(3),
  neighborhood: z.string().trim().min(2),
  complement: z.string().trim().max(200),
  referencePoint: z.string().trim().max(200),
  zipCode: z.string().trim().min(8),
  contactName: z.string().trim().min(2),
  contactRole: z.string().trim().min(2),
  contactPhone: z.string().trim().min(8),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"] });

const emptyForm = {
  companyName: "", cnpj: "", segment: "", city: "", state: "PR", phone: "", email: "",
  password: "", confirmPassword: "", website: "", description: "", address: "", neighborhood: "",
  complement: "", referencePoint: "", zipCode: "", contactName: "", contactRole: "", contactPhone: "",
};

export default function WaitlistActivationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("convite") || "";
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    document.title = "Ativar acesso · QBCAMP Conecta Mais";
    if (!token) { setError("Este convite não é válido."); setLoading(false); return; }
    supabase.functions.invoke("waitlist-activation", { body: { action: "inspect", token } })
      .then(({ data, error: invokeError }) => {
        if (invokeError || !data?.invitation) {
          setError(data?.error || "Este convite é inválido, expirou ou já foi utilizado.");
          return;
        }
        const invitation = data.invitation;
        setForm((current) => ({
          ...current,
          companyName: invitation.companyName || "",
          cnpj: formatCNPJ(invitation.cnpj || ""),
          segment: invitation.segment || "",
          phone: formatPhone(invitation.whatsapp || ""),
          contactName: invitation.contactName || "",
          contactPhone: formatPhone(invitation.whatsapp || ""),
        }));
      })
      .finally(() => setLoading(false));
  }, [token]);

  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error("Revise os campos obrigatórios e a senha."); return; }
    if (!logoFile) { toast.error("Adicione a logo da empresa."); return; }
    setSubmitting(true);
    const logoBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = () => reject(new Error("Logo inválida"));
      reader.readAsDataURL(logoFile);
    }).catch(() => "");
    if (!logoBase64) { setSubmitting(false); toast.error("Não foi possível processar a logo."); return; }
    const { confirmPassword: _confirmPassword, ...payload } = parsed.data;
    const { data, error: invokeError } = await supabase.functions.invoke("waitlist-activation", {
       body: { action: "activate", token, ...payload, logoBase64, logoType: logoFile.type },
    });
    setSubmitting(false);
    if (invokeError || !data?.success) { toast.error(data?.error || "Não foi possível ativar seu acesso."); return; }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: payload.email, password: payload.password });
    if (signInError) { toast.success("Acesso criado. Entre com seu e-mail e senha."); setDone(true); return; }
    toast.success("Acesso ativado com sucesso!");
    navigate("/dashboard", { replace: true });
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error) return (
    <div className="container flex min-h-[60vh] max-w-xl items-center justify-center py-12">
      <Card className="w-full"><CardHeader className="text-center"><ShieldAlert className="mx-auto h-10 w-10 text-destructive" /><CardTitle>Convite indisponível</CardTitle><CardDescription>{error}</CardDescription></CardHeader></Card>
    </div>
  );
  if (done) return (
    <div className="container flex min-h-[60vh] max-w-xl items-center justify-center py-12">
      <Card className="w-full"><CardHeader className="text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-primary" /><CardTitle>Seu acesso está pronto</CardTitle><CardDescription>Use o e-mail e a senha que você acabou de cadastrar.</CardDescription></CardHeader><CardContent><Button className="w-full" onClick={() => navigate("/login")}>Entrar no portal</Button></CardContent></Card>
    </div>
  );

  const field = (key: keyof typeof form, label: string, required = true, type = "text") => (
    <div><Label htmlFor={key}>{label}{required ? " *" : ""}</Label><Input id={key} type={type} value={form[key]} onChange={(e) => change(key, e.target.value)} required={required} /></div>
  );

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 text-center"><Building2 className="mx-auto mb-3 h-10 w-10 text-primary" /><h1 className="text-3xl font-extrabold text-foreground">Ative o acesso da sua empresa</h1><p className="mt-2 text-muted-foreground">Confirme os dados e crie sua senha para entrar no QBCAMP Conecta Mais.</p></div>
      <form onSubmit={submit} className="space-y-6">
        <Card><CardHeader><CardTitle>Empresa</CardTitle><CardDescription>Os dados do pré-cadastro já foram preenchidos.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label htmlFor="activation-logo">Logo da empresa *</Label><div className="mt-2 flex items-center gap-4">{logoPreview ? <img src={logoPreview} alt="Prévia da logo" className="h-20 w-32 rounded-md border border-border bg-card p-2 object-contain" /> : <div className="flex h-20 w-32 items-center justify-center rounded-md border-2 border-dashed border-border bg-muted"><ImagePlus className="h-6 w-6 text-muted-foreground" /></div>}<Input id="activation-logo" type="file" accept="image/png,image/jpeg,image/webp" required onChange={(event) => { const selected = event.target.files?.[0]; if (!selected) return; if (!selected.type.startsWith("image/") || selected.size > 2 * 1024 * 1024) { toast.error("Use uma imagem JPG, PNG ou WebP de até 2 MB."); event.target.value = ""; return; } setLogoFile(selected); setLogoPreview(URL.createObjectURL(selected)); }} /></div><p className="mt-2 text-xs text-muted-foreground">A logo aparecerá automaticamente na página inicial após a aprovação.</p></div>
          {field("companyName", "Nome da empresa")}
          <div><Label htmlFor="cnpj">CNPJ *</Label><Input id="cnpj" value={form.cnpj} onChange={(e) => change("cnpj", formatCNPJ(e.target.value))} required /></div>
          {field("segment", "Segmento")}{field("city", "Cidade")}{field("state", "Estado (UF)")}
          <div><Label htmlFor="phone">Telefone *</Label><Input id="phone" value={form.phone} onChange={(e) => change("phone", formatPhone(e.target.value))} required /></div>
          {field("website", "Site", false, "url")}
          <div className="sm:col-span-2"><Label htmlFor="description">Descrição *</Label><Textarea id="description" value={form.description} onChange={(e) => change("description", e.target.value)} required /></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Endereço</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          {field("address", "Endereço")}{field("neighborhood", "Bairro")}
          <div><Label htmlFor="zipCode">CEP *</Label><Input id="zipCode" value={form.zipCode} onChange={(e) => change("zipCode", formatCEP(e.target.value))} required /></div>
          {field("complement", "Complemento", false)}{field("referencePoint", "Ponto de referência", false)}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Responsável e acesso</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          {field("contactName", "Nome do responsável")}{field("contactRole", "Cargo")}{field("email", "E-mail de acesso", true, "email")}
          <div><Label htmlFor="contactPhone">WhatsApp *</Label><Input id="contactPhone" value={form.contactPhone} onChange={(e) => change("contactPhone", formatPhone(e.target.value))} required /></div>
          <div><Label htmlFor="password">Senha *</Label><PasswordInput id="password" value={form.password} onChange={(e) => change("password", e.target.value)} required /><p className="mt-1 text-xs text-muted-foreground">Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo.</p></div>
          <div><Label htmlFor="confirmPassword">Confirmar senha *</Label><PasswordInput id="confirmPassword" value={form.confirmPassword} onChange={(e) => change("confirmPassword", e.target.value)} required /></div>
        </CardContent></Card>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>{submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Ativando...</> : <><Lock className="mr-2 h-4 w-4" />Criar meu acesso</>}</Button>
      </form>
    </div>
  );
}