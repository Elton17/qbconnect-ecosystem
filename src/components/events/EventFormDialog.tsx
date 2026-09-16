import { useState, useEffect } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RegistrationFieldsConfig, { type RegistrationFieldKey } from "./RegistrationFieldsConfig";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import EventCover from "./EventCover";

const eventCategories = ["Networking", "Palestra", "Workshop", "Feira", "Curso", "Assembleia", "Social", "Outro"];
const eventTypes = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "hibrido", label: "Híbrido" },
];

export interface EventFormData {
  id?: string;
  title: string;
  description: string;
  short_description: string;
  category: string;
  event_type: string;
  location: string;
  address: string;
  city: string;
  state: string;
  online_url: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  price: string;
  is_free: boolean;
  max_attendees: string;
  featured: boolean;
  registration_fields: RegistrationFieldKey[];
}

const emptyForm: EventFormData = {
  title: "", description: "", short_description: "", category: "Networking",
  event_type: "presencial", location: "", address: "", city: "", state: "",
  online_url: "", start_date: "", end_date: "", price: "0", is_free: true,
  max_attendees: "", featured: false, registration_fields: ["nome"],
};

function toLocalDatetime(isoStr: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EventFormData | null;
  onSuccess: () => void;
}

export default function EventFormDialog({ open, onOpenChange, initialData, onSuccess }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<EventFormData>(emptyForm);
  const [registrationFields, setRegistrationFields] = useState<RegistrationFieldKey[]>(["nome"]);
  const [saving, setSaving] = useState(false);

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (open && initialData) {
      setForm({
        ...initialData,
        start_date: toLocalDatetime(initialData.start_date),
        end_date: initialData.end_date ? toLocalDatetime(initialData.end_date) : "",
      });
      setRegistrationFields(initialData.registration_fields || ["nome"]);
    } else if (open && !initialData) {
      setForm(emptyForm);
      setRegistrationFields(["nome"]);
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.title || !form.start_date) {
      toast({ title: "Preencha título e data do evento", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      short_description: form.short_description,
      category: form.category,
      event_type: form.event_type,
      location: form.location,
      address: form.address,
      city: form.city,
      state: form.state,
      online_url: form.online_url,
      start_date: new Date(form.start_date).toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      price: form.is_free ? 0 : parseFloat(form.price) || 0,
      is_free: form.is_free,
      max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
      featured: form.featured,
      registration_fields: registrationFields,
      moderation_status: "pending",
    };

    let error;
    if (isEditing) {
      if (!initialData?.id) return;
      ({ error } = await supabase.from("events").update(payload as any).eq("id", initialData.id));
    } else {
      ({ error } = await supabase.from("events").insert({ ...payload, user_id: user.id } as any));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isEditing ? "Alterações enviadas para aprovação!" : "Evento enviado para aprovação!" });
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Evento" : "Criar Evento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os detalhes do seu evento." : "Preencha os detalhes do seu evento."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Título do evento *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Workshop de Marketing Digital" />
          </div>
          <div>
            <Label>Descrição curta</Label>
            <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="Resumo em uma frase" />
          </div>
          <div>
            <Label>Descrição completa</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes, programação, palestrantes..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{eventCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{eventTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Prévia da capa automática</Label>
            <EventCover
              title={form.title || "Nome do evento"}
              startDate={form.start_date}
              category={form.category}
              eventType={form.event_type}
              isFree={form.is_free}
              price={Number(form.price) || 0}
              className="mt-1 border-[5px] border-secondary"
            />
            <p className="mt-1 text-xs text-muted-foreground">A capa usa automaticamente o nome, a data e a categoria do evento.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data e hora de início *</Label>
              <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <Label>Data e hora de término</Label>
              <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          {(form.event_type === "presencial" || form.event_type === "hibrido") && (
            <>
              <div>
                <Label>Local / Espaço</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Nome do local" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cidade</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cidade" />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="UF" maxLength={2} />
                </div>
              </div>
              <div>
                <Label>Endereço</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número" />
              </div>
            </>
          )}
          {(form.event_type === "online" || form.event_type === "hibrido") && (
            <div>
              <Label>Link do evento online</Label>
              <Input value={form.online_url} onChange={(e) => setForm({ ...form, online_url: e.target.value })} placeholder="https://meet.google.com/..." />
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_free} onCheckedChange={(v) => setForm({ ...form, is_free: v })} />
              <Label>Evento gratuito</Label>
            </div>
            {!form.is_free && (
              <div className="flex-1">
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Preço R$" />
              </div>
            )}
          </div>
          <div>
            <Label>Limite de vagas (deixe vazio para ilimitado)</Label>
            <Input type="number" value={form.max_attendees} onChange={(e) => setForm({ ...form, max_attendees: e.target.value })} placeholder="Ex: 100" />
          </div>

          <RegistrationFieldsConfig selected={registrationFields} onChange={setRegistrationFields} />

          <Button onClick={handleSubmit} disabled={saving || !form.title || !form.start_date} className="w-full">
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-1 h-4 w-4" />}
            {isEditing ? "Salvar Alterações" : "Publicar Evento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
