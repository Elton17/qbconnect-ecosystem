import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, GraduationCap, CalendarDays, Handshake, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  type: "product" | "course" | "event" | "opportunity";
  subtitle?: string;
}

const typeConfig = {
  product: { icon: ShoppingBag, label: "Produto", path: "/produto" },
  course: { icon: GraduationCap, label: "Curso", path: "/curso" },
  event: { icon: CalendarDays, label: "Evento", path: "/evento" },
  opportunity: { icon: Handshake, label: "Oportunidade", path: "/oportunidades" },
};

export default function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const term = `%${q}%`;
    const [products, courses, events, opportunities] = await Promise.all([
      supabase.from("products").select("id, title, category").eq("active", true).ilike("title", term).limit(5),
      supabase.from("courses").select("id, title, category").eq("active", true).ilike("title", term).limit(5),
      supabase.from("events").select("id, title, category").eq("active", true).ilike("title", term).limit(5),
      supabase.from("opportunities").select("id, title, type").eq("active", true).ilike("title", term).limit(5),
    ]);
    const r: SearchResult[] = [
      ...(products.data || []).map(p => ({ id: p.id, title: p.title, type: "product" as const, subtitle: p.category })),
      ...(courses.data || []).map(c => ({ id: c.id, title: c.title, type: "course" as const, subtitle: c.category })),
      ...(events.data || []).map(e => ({ id: e.id, title: e.title, type: "event" as const, subtitle: e.category })),
      ...(opportunities.data || []).map(o => ({ id: o.id, title: o.title, type: "opportunity" as const, subtitle: o.type })),
    ];
    setResults(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); }
  }, [open]);

  const handleSelect = (r: SearchResult) => {
    const cfg = typeConfig[r.type];
    if (r.type === "opportunity") {
      navigate("/oportunidades");
    } else {
      navigate(`${cfg.path}/${r.id}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] translate-y-0 sm:max-w-lg p-0 gap-0">
        <div className="flex items-center border-b border-border px-4">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar produtos, cursos, eventos, oportunidades..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
            autoFocus
          />
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {results.length === 0 && query.length >= 2 && !loading && (
            <p className="p-6 text-center text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
          )}
          {results.length === 0 && query.length < 2 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Digite ao menos 2 caracteres para buscar.</p>
          )}
          {results.map(r => {
            const cfg = typeConfig[r.type];
            const Icon = cfg.icon;
            return (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => handleSelect(r)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}{r.subtitle ? ` · ${r.subtitle}` : ""}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl+K</kbd> para abrir a busca
        </div>
      </DialogContent>
    </Dialog>
  );
}
