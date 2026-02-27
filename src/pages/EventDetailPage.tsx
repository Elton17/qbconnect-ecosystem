import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays, MapPin, Clock, Users, Globe, Ticket, ArrowLeft,
  Building2, Share2, Loader2, Check, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EVT-";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

interface EventDetail {
  id: string;
  user_id: string;
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
  image_url: string;
  start_date: string;
  end_date: string | null;
  price: number;
  is_free: boolean;
  max_attendees: number | null;
  featured: boolean;
  company_name?: string;
  registration_count?: number;
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      const { data } = await supabase.from("events").select("*").eq("id", id).single();
      if (!data) { setLoading(false); return; }

      const { data: profile } = await supabase.from("profiles").select("company_name").eq("user_id", data.user_id).single();
      const { data: regCount } = await supabase.from("event_registrations").select("event_id").eq("event_id", id);

      setEvent({
        ...data,
        company_name: profile?.company_name || "QBCAMP",
        registration_count: regCount?.length || 0,
      } as EventDetail);

      if (user) {
        const { data: reg } = await supabase.from("event_registrations")
          .select("ticket_code").eq("event_id", id).eq("user_id", user.id).single();
        if (reg) { setIsRegistered(true); setTicketCode(reg.ticket_code); }
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user || !event) return;
    setRegistering(true);
    const code = generateTicketCode();
    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id, user_id: user.id, ticket_code: code,
    });
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Você já está inscrito!" });
      } else {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
    } else {
      setIsRegistered(true);
      setTicketCode(code);
      setEvent({ ...event, registration_count: (event.registration_count || 0) + 1 });
      toast({ title: "Inscrição confirmada!" });
    }
    setRegistering(false);
  };

  const handleCopy = () => {
    if (ticketCode) {
      navigator.clipboard.writeText(ticketCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share && event) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado!" });
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!event) return <div className="container py-20 text-center"><p className="text-muted-foreground">Evento não encontrado.</p></div>;

  const isPast = new Date(event.start_date) < new Date();
  const isFull = event.max_attendees ? (event.registration_count || 0) >= event.max_attendees : false;
  const spotsLeft = event.max_attendees ? event.max_attendees - (event.registration_count || 0) : null;

  return (
    <div>
      {/* Hero Image */}
      <section className="relative">
        <div className="aspect-[3/1] max-h-[400px] w-full overflow-hidden bg-muted">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-secondary">
              <CalendarDays className="h-24 w-24 text-primary/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      </section>

      <div className="container relative -mt-20 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 card-shadow md:p-8">
              <Link to="/eventos" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Voltar aos eventos
              </Link>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">{event.category}</span>
                <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">{event.event_type === "presencial" ? "Presencial" : event.event_type === "online" ? "Online" : "Híbrido"}</span>
                {isPast && <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">Encerrado</span>}
              </div>

              <h1 className="mb-4 text-2xl font-extrabold text-card-foreground md:text-3xl">{event.title}</h1>

              {event.short_description && (
                <p className="mb-6 text-lg text-muted-foreground">{event.short_description}</p>
              )}

              <div className="mb-6 grid gap-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {format(new Date(event.start_date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-muted-foreground">
                      {format(new Date(event.start_date), "HH:mm", { locale: ptBR })}
                      {event.end_date && ` às ${format(new Date(event.end_date), "HH:mm", { locale: ptBR })}`}
                    </p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{event.location}</p>
                      <p className="text-muted-foreground">{event.address}{event.city ? `, ${event.city}` : ""}{event.state ? ` - ${event.state}` : ""}</p>
                    </div>
                  </div>
                )}
                {event.event_type !== "presencial" && event.online_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Link de acesso</p>
                      {isRegistered ? (
                        <a href={event.online_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{event.online_url}</a>
                      ) : (
                        <p className="text-muted-foreground">Disponível após inscrição</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{event.registration_count || 0} inscritos</p>
                    {spotsLeft !== null && <p className="text-muted-foreground">{spotsLeft > 0 ? `${spotsLeft} vagas restantes` : "Vagas esgotadas"}</p>}
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="prose prose-sm max-w-none text-foreground">
                  <h3 className="text-lg font-bold">Sobre o evento</h3>
                  <div className="whitespace-pre-wrap text-muted-foreground">{event.description}</div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            {/* Registration Card */}
            <div className="rounded-2xl border border-border bg-card p-6 card-shadow">
              <div className="mb-4 text-center">
                {event.is_free ? (
                  <p className="text-2xl font-extrabold text-accent-foreground">Gratuito</p>
                ) : (
                  <p className="text-2xl font-extrabold text-primary">R$ {event.price.toFixed(2).replace(".", ",")}</p>
                )}
              </div>

              {isRegistered ? (
                <div className="space-y-3">
                  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Seu ingresso</p>
                    <p className="text-xl font-mono font-bold tracking-widest text-primary">{ticketCode}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleCopy}>
                    {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                    {copied ? "Copiado!" : "Copiar código"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">Apresente este código no evento</p>
                </div>
              ) : isPast ? (
                <Button disabled className="w-full">Evento encerrado</Button>
              ) : (
                <Button onClick={handleRegister} disabled={registering || isFull} className="w-full" size="lg">
                  {registering ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Ticket className="mr-1 h-4 w-4" />}
                  {isFull ? "Vagas esgotadas" : "Inscrever-se"}
                </Button>
              )}
            </div>

            {/* Organizer */}
            <div className="rounded-2xl border border-border bg-card p-6 card-shadow">
              <h3 className="mb-3 text-sm font-bold text-card-foreground">Organizador</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {event.company_name?.charAt(0) || "Q"}
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{event.company_name}</p>
                  <p className="text-xs text-muted-foreground">Associado QBCAMP</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="mr-1 h-4 w-4" /> Compartilhar evento
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
