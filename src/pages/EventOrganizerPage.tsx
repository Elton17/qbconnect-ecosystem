import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Users, Download, Mail, Loader2, CalendarDays,
  Ticket, Search, Check, X, MessageSquare, Clock, Copy, Pencil
} from "lucide-react";
import EventFormDialog, { type EventFormData } from "@/components/events/EventFormDialog";
import { type RegistrationFieldKey } from "@/components/events/RegistrationFieldsConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Attendee {
  id: string;
  user_id: string;
  ticket_code: string;
  status: string;
  created_at: string;
  registration_data?: Record<string, string>;
  email?: string;
  company_name?: string;
  contact_name?: string;
  contact_phone?: string;
}

interface EventInfo {
  id: string;
  title: string;
  start_date: string;
  max_attendees: number | null;
  is_free: boolean;
  price: number;
  user_id: string;
}

export default function EventOrganizerPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [fullEvent, setFullEvent] = useState<any>(null);

  useEffect(() => {
    if (!id || !user) return;
    const fetch = async () => {
      // Check if user is admin
      const { data: isAdminData } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      const isUserAdmin = !!isAdminData;

      const { data: ev } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (!ev || (!isUserAdmin && ev.user_id !== user.id)) {
        setLoading(false);
        return;
      }
      setEvent(ev as EventInfo);
      setFullEvent(ev);

      const { data: regs } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", id)
        .order("created_at", { ascending: false });

      if (regs && regs.length > 0) {
        const userIds = regs.map((r: any) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, email, company_name, contact_name, contact_phone")
          .in("user_id", userIds);

        const profileMap = new Map(
          (profiles || []).map((p: any) => [p.user_id, p])
        );

        setAttendees(
          regs.map((r: any) => {
            const profile = profileMap.get(r.user_id);
            const rd = r.registration_data || {};
            return {
              ...r,
              registration_data: rd,
              email: rd.email || profile?.email || "",
              company_name: rd.empresa || profile?.company_name || "",
              contact_name: rd.nome || profile?.contact_name || "",
              contact_phone: rd.whatsapp || profile?.contact_phone || "",
            };
          })
        );
      }
      setLoading(false);
    };
    fetch();
  }, [id, user]);

  const filtered = attendees.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.ticket_code.toLowerCase().includes(q) ||
      (a.contact_name || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q) ||
      (a.company_name || "").toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedAttendees);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedAttendees(next);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAttendees(new Set());
    } else {
      setSelectedAttendees(new Set(filtered.map((a) => a.id)));
    }
    setSelectAll(!selectAll);
  };

  const exportCSV = () => {
    const rows = [
      ["Nome", "Empresa", "Email", "Telefone", "CPF", "CNPJ", "Cargo", "Código Ingresso", "Status", "Data Inscrição"],
      ...filtered.map((a) => [
        a.contact_name || "",
        a.company_name || "",
        a.email || "",
        a.contact_phone || "",
        a.registration_data?.cpf || "",
        a.registration_data?.cnpj || "",
        a.registration_data?.cargo || "",
        a.ticket_code,
        a.status || "confirmed",
        a.created_at ? format(new Date(a.created_at), "dd/MM/yyyy HH:mm") : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscritos-${event?.title?.replace(/\s+/g, "-") || "evento"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado com sucesso!" });
  };

  const handleSendMessage = () => {
    const targets = attendees.filter((a) => selectedAttendees.has(a.id));
    const emails = targets.map((a) => a.email).filter(Boolean);
    if (emails.length === 0) {
      toast({ title: "Nenhum destinatário selecionado", variant: "destructive" });
      return;
    }
    // Open mailto with all selected emails
    const subject = encodeURIComponent(messageSubject || `[${event?.title}] Mensagem do organizador`);
    const body = encodeURIComponent(messageBody);
    const mailto = `mailto:${emails.join(",")}?subject=${subject}&body=${body}`;
    window.open(mailto, "_blank");
    setMessageOpen(false);
    setMessageSubject("");
    setMessageBody("");
    toast({ title: `Mensagem preparada para ${emails.length} participante(s)` });
  };

  const copyEmails = () => {
    const emails = attendees.map((a) => a.email).filter(Boolean).join(", ");
    navigator.clipboard.writeText(emails);
    toast({ title: "Emails copiados!" });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Evento não encontrado ou você não é o organizador.</p>
        <Link to="/eventos">
          <Button variant="outline" className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  const confirmedCount = attendees.filter((a) => a.status === "confirmed").length;

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-6">
          <Link to={`/evento/${event.id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar ao evento
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">Painel do Organizador</h1>
              <p className="text-muted-foreground">{event.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                <Pencil className="mr-1 h-4 w-4" /> Editar Evento
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                {format(new Date(event.start_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total de Inscritos", value: attendees.length, icon: Users, color: "text-primary" },
            { label: "Confirmados", value: confirmedCount, icon: Check, color: "text-accent" },
            { label: "Vagas Restantes", value: event.max_attendees ? Math.max(0, event.max_attendees - attendees.length) : "∞", icon: Ticket, color: "text-muted-foreground" },
            { label: "Receita Estimada", value: event.is_free ? "Gratuito" : `R$ ${(attendees.length * event.price).toFixed(2).replace(".", ",")}`, icon: Clock, color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 card-shadow">
              <div className="mb-2 flex items-center gap-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-card-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 card-shadow sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, empresa ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyEmails}>
              <Copy className="mr-1 h-4 w-4" /> Copiar Emails
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="mr-1 h-4 w-4" /> Exportar CSV
            </Button>
            <Button
              size="sm"
              onClick={() => setMessageOpen(true)}
              disabled={selectedAttendees.size === 0}
            >
              <Mail className="mr-1 h-4 w-4" /> Enviar Mensagem ({selectedAttendees.size})
            </Button>
          </div>
        </div>

        {/* Table */}
        {attendees.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum inscrito ainda</p>
            <p className="text-sm text-muted-foreground">Compartilhe o evento para atrair participantes.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card card-shadow">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                    </TableHead>
                    <TableHead>Participante</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Ingresso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id} className="hover:bg-muted/30">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedAttendees.has(a.id)}
                          onChange={() => toggleSelect(a.id)}
                          className="h-4 w-4 rounded border-input accent-primary"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-card-foreground">
                        {a.contact_name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {a.registration_data?.cpf || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.company_name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {a.registration_data?.cnpj || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.email || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.contact_phone || "—"}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-bold text-primary">
                          {a.ticket_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={a.status === "confirmed" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {a.status === "confirmed" ? "Confirmado" : a.status || "Confirmado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.created_at
                          ? format(new Date(a.created_at), "dd/MM/yy HH:mm")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border-t border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {filtered.length} de {attendees.length} inscrito(s)
              {selectedAttendees.size > 0 && ` • ${selectedAttendees.size} selecionado(s)`}
            </div>
          </div>
        )}
      </motion.div>

      {/* Send Message Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Enviar Mensagem
            </DialogTitle>
            <DialogDescription>
              Envie uma mensagem para {selectedAttendees.size} participante(s) selecionado(s).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Assunto</label>
              <Input
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder={`[${event?.title}] Informações importantes`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Mensagem</label>
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Escreva sua mensagem para os participantes..."
                rows={6}
              />
            </div>
            <Button onClick={handleSendMessage} className="w-full">
              <Mail className="mr-1 h-4 w-4" /> Abrir cliente de email
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Será aberto seu cliente de email com os destinatários preenchidos.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {fullEvent && (
        <EventFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          initialData={{
            id: fullEvent.id,
            title: fullEvent.title || "",
            description: fullEvent.description || "",
            short_description: fullEvent.short_description || "",
            category: fullEvent.category || "Networking",
            event_type: fullEvent.event_type || "presencial",
            location: fullEvent.location || "",
            address: fullEvent.address || "",
            city: fullEvent.city || "",
            state: fullEvent.state || "",
            online_url: fullEvent.online_url || "",
            image_url: fullEvent.image_url || "",
            start_date: fullEvent.start_date || "",
            end_date: fullEvent.end_date || "",
            price: String(fullEvent.price || 0),
            is_free: fullEvent.is_free ?? true,
            max_attendees: fullEvent.max_attendees ? String(fullEvent.max_attendees) : "",
            featured: fullEvent.featured ?? false,
            registration_fields: (fullEvent.registration_fields as RegistrationFieldKey[]) || ["nome"],
          }}
          onSuccess={() => {
            setEditDialogOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
