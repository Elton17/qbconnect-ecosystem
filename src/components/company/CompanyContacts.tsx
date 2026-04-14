import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Phone, Mail, MessageCircle, User, Building2, StickyNote, Star, FileDown } from "lucide-react";
import CsvContactImport from "./CsvContactImport";

interface Contact {
  id: string;
  user_id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  whatsapp: string;
  notes: string;
  is_primary: boolean;
}

const emptyForm = { name: "", role: "", department: "", email: "", phone: "", whatsapp: "", notes: "", is_primary: false };

interface Props {
  companyUserId: string;
  editable?: boolean;
}

export default function CompanyContacts({ companyUserId, editable = false }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const canEdit = editable && user?.id === companyUserId;

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("company_contacts")
      .select("*")
      .eq("user_id", companyUserId)
      .order("is_primary", { ascending: false })
      .order("name");
    setContacts((data as Contact[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, [companyUserId]);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(false); };

  const handleSubmit = async () => {
    if (!user || !form.name.trim()) return;
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from("company_contacts").update({
        name: form.name.trim(), role: form.role.trim(), department: form.department.trim(),
        email: form.email.trim(), phone: form.phone.trim(), whatsapp: form.whatsapp.trim(),
        notes: form.notes.trim(), is_primary: form.is_primary,
      }).eq("id", editingId);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else { toast({ title: "Contato atualizado!" }); resetForm(); fetchContacts(); }
    } else {
      const { error } = await supabase.from("company_contacts").insert({
        user_id: user.id, name: form.name.trim(), role: form.role.trim(), department: form.department.trim(),
        email: form.email.trim(), phone: form.phone.trim(), whatsapp: form.whatsapp.trim(),
        notes: form.notes.trim(), is_primary: form.is_primary,
      });
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else { toast({ title: "Contato adicionado!" }); resetForm(); fetchContacts(); }
    }
    setSaving(false);
  };

  const handleEdit = (c: Contact) => {
    setEditingId(c.id);
    setForm({ name: c.name, role: c.role, department: c.department, email: c.email, phone: c.phone, whatsapp: c.whatsapp, notes: c.notes, is_primary: c.is_primary });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("company_contacts").delete().eq("id", id);
    toast({ title: "Contato removido!" });
    fetchContacts();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      {canEdit && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <CsvContactImport userId={user!.id} onImported={fetchContacts} />
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="mr-1.5 h-4 w-4" /> Adicionar Contato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Contato" : "Novo Contato"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Nome *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
                  </div>
                  <div>
                    <Label>Cargo</Label>
                    <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Diretor Comercial" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Departamento</Label>
                    <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Ex: Comercial" />
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Telefone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(41) 3333-4444" />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="5541999999999" />
                  </div>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Informações adicionais sobre este contato..." rows={3} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_primary} onCheckedChange={(v) => setForm({ ...form, is_primary: v })} />
                  <Label>Contato principal</Label>
                </div>
                <Button onClick={handleSubmit} disabled={saving || !form.name.trim()} className="w-full">
                  {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  {editingId ? "Salvar Alterações" : "Adicionar Contato"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="py-12 text-center">
          <User className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhum contato cadastrado.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((c) => (
            <Card key={c.id} className="card-shadow hover:card-shadow-hover transition-all">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-card-foreground">{c.name}</h4>
                        {c.is_primary && <Badge className="bg-primary/10 text-primary border-0 text-xs"><Star className="mr-0.5 h-3 w-3" /> Principal</Badge>}
                      </div>
                      {c.role && <p className="text-sm text-muted-foreground">{c.role}</p>}
                      {c.department && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" /> {c.department}
                        </p>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => confirmDelete(() => handleDelete(c.id))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Mail className="h-3 w-3" /> {c.email}
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </a>
                  )}
                  {c.whatsapp && (
                    <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-[#25D366]/10 px-2 py-1 text-xs text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                  )}
                </div>

                {c.notes && (
                  <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-muted/50 p-2">
                    <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{c.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {ConfirmDialog}
    </div>
  );
}
