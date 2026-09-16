import { useCallback, useEffect, useState } from "react";
import { FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useApprovedCompany } from "@/hooks/useApprovedCompany";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { attachNewsPresentation, type NewsItem } from "@/lib/news";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NewsFormDialog from "./NewsFormDialog";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const statusLabels = { pending: "Aguardando aprovação", approved: "Publicada", rejected: "Recusada" };

export default function MyNewsManager() {
  const { user } = useAuth();
  const { approved, checking } = useApprovedCompany();
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("news").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setItems(await attachNewsPresentation(data || []));
    setLoading(false);
  }, [user]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (searchParams.get("cadastrar") === "noticia" && approved && !checking) {
      setEditing(null);
      setDialogOpen(true);
    }
  }, [searchParams, approved, checking]);

  async function remove(item: NewsItem) {
    const { error } = await supabase.from("news").delete().eq("id", item.id);
    if (error) { toast.error("Não foi possível excluir a notícia."); return; }
    if (item.cover_image_path) await supabase.storage.from("news").remove([item.cover_image_path]);
    toast.success("Notícia excluída.");
    void load();
  }

  if (checking || loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  return <section className="mt-8 border-t border-border pt-8">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-foreground">Minhas Notícias</h2><p className="text-sm text-muted-foreground">Compartilhe novidades da sua empresa e do seu segmento.</p></div>{approved && <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Nova notícia</Button>}</div>
    {!approved ? <div className="rounded-md border border-border bg-muted/40 p-5 text-sm text-muted-foreground">A publicação será liberada após a aprovação da sua empresa.</div> : items.length === 0 ? <div className="rounded-md border border-dashed border-border p-8 text-center"><FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Você ainda não enviou notícias.</p></div> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="font-semibold text-card-foreground">{item.title}</h3><Badge variant={item.status === "approved" ? "default" : item.status === "rejected" ? "destructive" : "secondary"}>{statusLabels[item.status as keyof typeof statusLabels] || item.status}</Badge></div><p className="line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>{item.rejection_reason && <p className="mt-2 text-sm text-destructive">Motivo: {item.rejection_reason}</p>}</div><div className="flex shrink-0 gap-2"><Button variant="outline" size="sm" onClick={() => { setEditing(item); setDialogOpen(true); }}><Pencil className="mr-1 h-4 w-4" /> Editar</Button><Button variant="destructive" size="icon" onClick={() => confirmDelete(() => void remove(item))} title="Excluir notícia"><Trash2 className="h-4 w-4" /></Button></div></article>)}</div>}
    <NewsFormDialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open && searchParams.get("cadastrar") === "noticia") setSearchParams({}, { replace: true }); }} item={editing} onSaved={load} />{ConfirmDialog}
  </section>;
}
