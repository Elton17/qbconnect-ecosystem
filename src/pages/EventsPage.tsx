import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays, MapPin, Search, Plus, Loader2, Users, Clock, Ticket, Star,
  Filter, ArrowRight, Globe, Building2, Tag, Sparkles, Pencil
} from "lucide-react";
import EventFormDialog, { type EventFormData } from "@/components/events/EventFormDialog";
import { type RegistrationFieldKey } from "@/components/events/RegistrationFieldsConfig";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const eventCategories = ["Todos", "Networking", "Palestra", "Workshop", "Feira", "Curso", "Assembleia", "Social", "Outro"];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface EventItem {
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
  registration_fields?: RegistrationFieldKey[];
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, "EEE, dd 'de' MMM 'às' HH:mm", { locale: ptBR });
}

function formatShortDate(dateStr: string): { day: string; month: string } {
  const date = new Date(dateStr);
  return {
    day: format(date, "dd"),
    month: format(date, "MMM", { locale: ptBR }).toUpperCase(),
  };
}

function eventToFormData(event: EventItem): EventFormData {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    short_description: event.short_description,
    category: event.category,
    event_type: event.event_type,
    location: event.location,
    address: event.address,
    city: event.city,
    state: event.state,
    online_url: event.online_url,
    image_url: event.image_url,
    start_date: event.start_date,
    end_date: event.end_date || "",
    price: String(event.price || 0),
    is_free: event.is_free,
    max_attendees: event.max_attendees ? String(event.max_attendees) : "",
    featured: event.featured,
    registration_fields: event.registration_fields || ["nome"],
  };
}

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<EventFormData | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const fetchAllEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("active", true)
      .order("start_date", { ascending: true });

    if (!data) { setLoading(false); return; }

    const userIds = [...new Set(data.map((e: any) => e.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, company_name").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.company_name]));

    const eventIds = data.map((e: any) => e.id);
    const { data: regCounts } = await supabase
      .from("event_registrations")
      .select("event_id")
      .in("event_id", eventIds);

    const countMap = new Map<string, number>();
    (regCounts || []).forEach((r: any) => {
      countMap.set(r.event_id, (countMap.get(r.event_id) || 0) + 1);
    });

    setEvents(data.map((e: any) => ({
      ...e,
      company_name: profileMap.get(e.user_id) || "QBCAMP",
      registration_count: countMap.get(e.id) || 0,
    })));

    if (user) {
      const { data: regs } = await supabase.from("event_registrations").select("event_id").eq("user_id", user.id);
      if (regs) setUserRegistrations(new Set(regs.map((r: any) => r.event_id)));
    }

    setLoading(false);
  };

  useEffect(() => { fetchAllEvents(); }, [user]);

  const handleRegister = (event: EventItem) => {
    navigate(`/evento/${event.id}`);
  };

  const handleEdit = (event: EventItem) => {
    setEditData(eventToFormData(event));
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditData(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    toast({ title: "Evento removido" });
    fetchAllEvents();
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.start_date) >= now);
  const pastEvents = events.filter(e => new Date(e.start_date) < now);
  const featuredEvents = upcomingEvents.filter(e => e.featured);

  const filteredEvents = upcomingEvents.filter((e) => {
    const matchCat = activeCategory === "Todos" || e.category === activeCategory;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 h-64 w-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute right-0 top-1/3 h-48 w-48 rounded-full bg-primary/60 blur-2xl" />
        </div>
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <CalendarDays className="h-4 w-4" /> Portal de Eventos
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl lg:text-6xl">
              Eventos & Experiências{" "}
              <span className="text-gradient">QBCAMP</span>
            </h1>
            <p className="mb-8 text-lg text-secondary-foreground/70 md:text-xl">
              Feiras, workshops, networking e capacitações exclusivas para associados e comunidade empresarial.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              {isAdmin && (
                <Button variant="hero" size="xl" onClick={handleCreate}>
                  <Plus className="mr-1 h-5 w-5" /> Criar Evento
                </Button>
              )}
              <Button variant="heroOutline" size="xl" onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}>
                Explorar Eventos
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              { label: "Eventos Próximos", value: `${upcomingEvents.length}`, icon: CalendarDays },
              { label: "Inscritos Total", value: `${events.reduce((acc, e) => acc + (e.registration_count || 0), 0)}`, icon: Users },
              { label: "Categorias", value: `${eventCategories.length - 1}`, icon: Tag },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 px-5 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-secondary-foreground">{stat.value}</div>
                  <div className="text-xs text-secondary-foreground/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="border-b border-border bg-muted/30 py-10">
          <div className="container">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-foreground md:text-2xl">Eventos em Destaque</h2>
                <p className="text-sm text-muted-foreground">Não perca esses eventos especiais</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.slice(0, 3).map((event, i) => {
                const dateInfo = formatShortDate(event.start_date);
                const isRegistered = userRegistrations.has(event.id);
                const isFull = event.max_attendees ? (event.registration_count || 0) >= event.max_attendees : false;
                return (
                  <motion.div key={event.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                    className="group overflow-hidden rounded-2xl border-2 border-primary/20 bg-card card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1">
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <CalendarDays className="h-16 w-16 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-card/90 px-3 py-2 shadow-lg backdrop-blur-sm">
                        <span className="text-2xl font-extrabold leading-none text-primary">{dateInfo.day}</span>
                        <span className="text-xs font-bold uppercase text-muted-foreground">{dateInfo.month}</span>
                      </div>
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                          <Sparkles className="mr-1 inline h-3 w-3" />Destaque
                        </span>
                      </div>
                      {event.is_free && (
                        <div className="absolute bottom-3 right-3">
                          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow">Gratuito</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="mb-2 text-lg font-bold text-card-foreground line-clamp-2">{event.title}</h3>
                      <div className="mb-3 space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {formatEventDate(event.start_date)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" /> {event.location}{event.city ? ` - ${event.city}` : ""}
                          </div>
                        )}
                        {event.event_type === "online" && (
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" /> Evento Online
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" /> {event.registration_count || 0} inscritos
                          {event.max_attendees && <span className="text-xs">/ {event.max_attendees} vagas</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/evento/${event.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Ver detalhes <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant={isRegistered ? "secondary" : "default"}
                          size="sm"
                          disabled={isFull && !isRegistered}
                          onClick={() => handleRegister(event)}
                        >
                          <Ticket className="mr-1 h-3.5 w-3.5" />
                          {isRegistered ? "Inscrito" : isFull ? "Esgotado" : "Inscrever"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Events */}
      <div className="container py-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {eventCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum evento encontrado.</p>
            {isAdmin && (
              <Button className="mt-4" onClick={handleCreate}>
                <Plus className="mr-1 h-4 w-4" /> Criar primeiro evento
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map((event, i) => {
              const dateInfo = formatShortDate(event.start_date);
              const isRegistered = userRegistrations.has(event.id);
              const isFull = event.max_attendees ? (event.registration_count || 0) >= event.max_attendees : false;
              return (
                <motion.div key={event.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                  className="group overflow-hidden rounded-2xl border border-border bg-card card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1">
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <CalendarDays className="h-12 w-12 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-card/90 px-3 py-2 shadow backdrop-blur-sm">
                      <span className="text-xl font-extrabold leading-none text-primary">{dateInfo.day}</span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">{dateInfo.month}</span>
                    </div>
                    {event.is_free ? (
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">Gratuito</span>
                      </div>
                    ) : (
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                          R$ {event.price.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="mb-1.5 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {event.category}
                    </span>
                    <h3 className="mb-1.5 text-sm font-bold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatEventDate(event.start_date)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {event.location}{event.city ? ` - ${event.city}` : ""}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {event.registration_count || 0} inscritos
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/evento/${event.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs">Detalhes</Button>
                      </Link>
                      <Button
                        variant={isRegistered ? "secondary" : "default"}
                        size="sm"
                        className="text-xs"
                        disabled={isFull && !isRegistered}
                        onClick={() => handleRegister(event)}
                      >
                        {isRegistered ? "Inscrito ✓" : isFull ? "Esgotado" : "Inscrever"}
                      </Button>
                    </div>
                    {isAdmin && (
                      <div className="mt-2 flex gap-2 border-t border-border pt-2">
                        <Link to={`/evento/${event.id}/painel`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <Users className="mr-1 h-3 w-3" /> Gerenciar
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => handleEdit(event)}>
                          <Pencil className="mr-1 h-3 w-3" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => confirmDelete(() => handleDelete(event.id))}>
                          Remover
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-foreground">Eventos Passados</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {pastEvents.slice(0, 8).map((event) => {
                const dateInfo = formatShortDate(event.start_date);
                return (
                  <div key={event.id} className="flex gap-3 rounded-xl border border-border bg-card p-3 opacity-60">
                    <div className="flex flex-col items-center rounded-lg bg-muted px-2.5 py-1.5">
                      <span className="text-lg font-bold text-muted-foreground">{dateInfo.day}</span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">{dateInfo.month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-card-foreground line-clamp-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">{event.company_name}</p>
                      <p className="text-xs text-muted-foreground">{event.registration_count || 0} participaram</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editData}
        onSuccess={fetchAllEvents}
      />
      {ConfirmDialog}
    </div>
  );
}
