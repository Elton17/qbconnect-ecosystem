import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, MapPin, Search, Plus, Loader2, Users, Clock, Ticket, Star,
  Filter, ArrowRight, Globe, Building2, Tag, Sparkles, ImagePlus, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const eventCategories = ["Todos", "Networking", "Palestra", "Workshop", "Feira", "Curso", "Assembleia", "Social", "Outro"];
const eventTypes = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "hibrido", label: "Híbrido" },
];

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
}

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EVT-";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
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

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    title: "", description: "", short_description: "", category: "Networking",
    event_type: "presencial", location: "", address: "", city: "", state: "",
    online_url: "", start_date: "", end_date: "", price: "0", is_free: true,
    max_attendees: "", featured: false,
  });

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("active", true)
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true });

    if (!data) { setLoading(false); return; }

    const userIds = [...new Set(data.map((e: any) => e.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, company_name").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.company_name]));

    // Get registration counts
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

  // Also fetch past events for display
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem muito grande (máx 5MB)", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.title || !form.start_date) {
      toast({ title: "Preencha título e data do evento", variant: "destructive" });
      return;
    }
    setSaving(true);

    let imageUrl = "";
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `events/${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("products").upload(path, imageFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("products").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("events").insert({
      user_id: user.id,
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
      image_url: imageUrl,
      start_date: new Date(form.start_date).toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      price: form.is_free ? 0 : parseFloat(form.price) || 0,
      is_free: form.is_free,
      max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
      featured: form.featured,
    });

    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Evento criado com sucesso!" });
      setDialogOpen(false);
      setForm({
        title: "", description: "", short_description: "", category: "Networking",
        event_type: "presencial", location: "", address: "", city: "", state: "",
        online_url: "", start_date: "", end_date: "", price: "0", is_free: true,
        max_attendees: "", featured: false,
      });
      setImageFile(null);
      setImagePreview("");
      fetchAllEvents();
    }
  };

  const handleRegister = async (event: EventItem) => {
    if (!user) {
      toast({ title: "Faça login", description: "Você precisa estar logado para se inscrever.", variant: "destructive" });
      return;
    }
    if (userRegistrations.has(event.id)) {
      toast({ title: "Você já está inscrito neste evento!" });
      return;
    }
    const code = generateTicketCode();
    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id, user_id: user.id, ticket_code: code,
    });
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Você já está inscrito neste evento!" });
      } else {
        toast({ title: "Erro ao inscrever", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Inscrição confirmada!", description: `Seu código: ${code}` });
      setUserRegistrations(new Set([...userRegistrations, event.id]));
      fetchAllEvents();
    }
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
              {user && (
                <Button variant="hero" size="xl" onClick={() => setDialogOpen(true)}>
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
            {user && (
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
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
                    {user?.id === event.user_id && (
                      <div className="mt-2 flex gap-2 border-t border-border pt-2">
                        <Link to={`/evento/${event.id}/painel`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <Users className="mr-1 h-3 w-3" /> Gerenciar
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(event.id)}>
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

      {/* Create Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Criar Evento
            </DialogTitle>
            <DialogDescription>Preencha os detalhes do seu evento.</DialogDescription>
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
                  <SelectContent>{eventCategories.filter(c => c !== "Todos").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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

            {/* Image upload */}
            <div>
              <Label>Imagem de capa</Label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
              {imagePreview ? (
                <div className="relative mt-1 aspect-[16/9] overflow-hidden rounded-lg border border-border">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button onClick={() => { setImageFile(null); setImagePreview(""); }} className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="mt-1 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted/50 py-8 transition-colors hover:border-primary/50">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-sm">Clique para adicionar imagem</span>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={saving || !form.title || !form.start_date} className="w-full">
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-1 h-4 w-4" />}
              Publicar Evento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
