import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ShoppingBag, GraduationCap, CalendarDays, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FeedItem {
  id: string;
  title: string;
  type: "product" | "course" | "event";
  created_at: string;
  href: string;
}

const icons = {
  product: ShoppingBag,
  course: GraduationCap,
  event: CalendarDays,
};

const labels = {
  product: "Novo produto",
  course: "Novo curso",
  event: "Novo evento",
};

export default function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    async function fetch() {
      const [products, courses, events] = await Promise.all([
        supabase.from("products").select("id, title, created_at").eq("active", true).order("created_at", { ascending: false }).limit(5),
        supabase.from("courses").select("id, title, created_at").eq("active", true).order("created_at", { ascending: false }).limit(5),
        supabase.from("events").select("id, title, created_at").eq("active", true).order("created_at", { ascending: false }).limit(5),
      ]);

      const all: FeedItem[] = [
        ...(products.data || []).map(p => ({ id: p.id, title: p.title, type: "product" as const, created_at: p.created_at!, href: `/produto/${p.id}` })),
        ...(courses.data || []).map(c => ({ id: c.id, title: c.title, type: "course" as const, created_at: c.created_at!, href: `/curso/${c.id}` })),
        ...(events.data || []).map(e => ({ id: e.id, title: e.title, type: "event" as const, created_at: e.created_at!, href: `/evento/${e.id}` })),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);

      setItems(all);
    }
    fetch();
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-extrabold text-foreground md:text-3xl">Atividade Recente</h2>
          <p className="text-muted-foreground">O que está acontecendo na plataforma agora</p>
        </motion.div>

        <div className="mx-auto max-w-2xl space-y-2">
          {items.map((item, i) => {
            const Icon = icons[item.type];
            return (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={item.href}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:bg-muted/50 hover:card-shadow"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{labels[item.type]}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
