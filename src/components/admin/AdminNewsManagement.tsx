import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { attachNewsPresentation, type NewsItem } from "@/lib/news";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NewsFormDialog from "@/components/news/NewsFormDialog";
import { toast } from "sonner";

const filters = [{ value: "all", label: "Todas" }, { value: "approved", label: "Publicadas" }];

export default function AdminNewsManagement() {
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<NewsItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    setItems(await attachNewsPresentation(data || []));
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => items.filter((item) => (filter === "all" || item.status === filter) && `${item.title} ${item.company_name}`.toLowerCase().includes(search.toLowerCase())), [items, filter, search]);

  async function remove(item: NewsItem) {
    const { error } = await supabase.from("news").delete().eq("id", item.id);
    if (error) { toast.error("Não foi possível excluir a notícia."); return; }
    if (item.cover_image_path) await supabase.storage.from("news").remove([item.cover_image_path]);
    toast.success("Notícia excluída."); void load();
  }

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto">{filters.map((option) => <Button key={option.value} size="sm" variant={filter === option.value ? "default" : "outline"} onClick={() => setFilter(option.value)}>{option.label} ({option.value === "all" ? items.length : items.filter((item) => item.status === option.value).length})</Button>)}</div><div className="relative lg:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar título ou empresa..." /></div></div>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : visible.length === 0 ? <div className="rounded-md border border-dashed border-border py-14 text-center text-sm text-muted-foreground">Nenhuma notícia encontrada.</div> : <div className="space-y-3">{visible.map((item) => <article key={item.id} className="rounded-md border border-border bg-card p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge>Publicada</Badge><span className="text-xs text-muted-foreground">{item.category} · {item.company_name}</span></div><h3 className="font-bold text-card-foreground">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild><Link to={`/noticias/${item.id}`}><Eye className="mr-1 h-4 w-4" /> Ver</Link></Button><Button size="sm" variant="outline" onClick={() => setEditing(item)}><Pencil className="mr-1 h-4 w-4" /> Editar</Button><Button size="icon" variant="destructive" onClick={() => confirmDelete(() => void remove(item))} title="Excluir"><Trash2 className="h-4 w-4" /></Button></div></div></article>)}</div>}
    <NewsFormDialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }} item={editing} onSaved={load} adminMode />{ConfirmDialog}
  </div>;
}
