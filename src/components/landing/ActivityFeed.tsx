import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Handshake, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { attachNewsPresentation } from "@/lib/news";

interface FeedItem {
  id: string;
  title: string;
  type: "news" | "event" | "opportunity";
  created_at: string;
  href: string;
  description: string;
  image?: string | null;
}

const icons = {
  news: Newspaper,
  event: CalendarDays,
  opportunity: Handshake,
};

const labels = {
  news: "Notícia",
  event: "Evento",
  opportunity: "Oportunidade",
};

export default function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    async function fetch() {
      const [newsResponse, events, opportunities] = await Promise.all([
        supabase.from("news").select("*").eq("status", "approved").order("published_at", { ascending: false }).limit(4),
        supabase.from("events").select("id, title, short_description, description, image_url, start_date, created_at").eq("active", true).order("start_date", { ascending: true }).limit(4),
        supabase.from("opportunities").select("id, title, description, created_at").eq("active", true).eq("status", "open").order("created_at", { ascending: false }).limit(4),
      ]);

      const news = await attachNewsPresentation(newsResponse.data || []);

      const all: FeedItem[] = [
        ...news.map(item => ({ id: item.id, title: item.title, description: item.summary, image: item.cover_url, type: "news" as const, created_at: item.published_at || item.created_at, href: `/noticias/${item.id}` })),
        ...(events.data || []).map(item => ({ id: item.id, title: item.title, description: item.short_description || item.description || "Confira os detalhes deste evento regional.", image: item.image_url, type: "event" as const, created_at: item.start_date || item.created_at || new Date().toISOString(), href: `/evento/${item.id}` })),
        ...(opportunities.data || []).map(item => ({ id: item.id, title: item.title, description: item.description || "Uma nova possibilidade de parceria para empresas da região.", type: "opportunity" as const, created_at: item.created_at || new Date().toISOString(), href: "/oportunidades" })),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setItems(all);
    }
    fetch();
  }, []);

  const featured = items[0];
  const supporting = items.slice(1);

  return (
    <section className="border-y border-border bg-muted/30 py-14 md:py-20">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase text-primary">Em destaque</p>
            <h2 className="text-3xl font-extrabold text-foreground md:text-4xl">Destaques da região</h2>
            <p className="mt-2 text-muted-foreground">Informação, encontros e oportunidades que movimentam nossos negócios.</p>
          </div>
          <Link to="/noticias" className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Ver portal de notícias <ArrowRight className="h-4 w-4" /></Link>
        </motion.div>

        {!featured ? (
          <div className="border-y border-dashed border-border py-14 text-center text-muted-foreground">Novos destaques serão publicados em breve.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            <Link to={featured.href} className="group relative min-h-[420px] overflow-hidden rounded-lg bg-secondary">
              {featured.image ? <img src={featured.image} alt={featured.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <div className="absolute inset-0 flex items-center justify-center bg-secondary"><Newspaper className="h-20 w-20 text-secondary-foreground/20" /></div>}
              <div className="absolute inset-0 bg-secondary/65" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-secondary-foreground md:p-8">
                <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase text-primary">{labels[featured.type]}</span>
                <h3 className="text-2xl font-extrabold leading-tight md:text-3xl">{featured.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm text-secondary-foreground/80 md:text-base">{featured.description}</p>
                <span className="mt-5 flex items-center gap-2 text-sm font-semibold">Saiba mais <ArrowRight className="h-4 w-4" /></span>
              </div>
            </Link>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {supporting.map((item, i) => {
            const Icon = icons[item.type];
            return (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={item.href}
                  className="group flex h-full min-h-24 items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2"><span className="text-xs font-semibold uppercase text-primary">{labels[item.type]}</span><span className="text-xs text-muted-foreground">{format(new Date(item.created_at), "dd MMM", { locale: ptBR })}</span></div>
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">{item.title}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
            </div>
          </div>
        )}
        </div>
    </section>
  );
}
