import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { attachNewsPresentation, type NewsItem } from "@/lib/news";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import NewsFormDialog from "@/components/news/NewsFormDialog";
import { toast } from "sonner";

const filters = [{ value: "all", label: "Todas" }, { value: "pending", label: "Aguardando" }, { value: "approved", label: "Publicadas" }, { value: "rejected", label: "Recusadas" }];

export default function AdminNewsManagement() {
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [decision, setDecision] = useState<{ item: NewsItem; kind: "approve" | "reject" | "unpublish" } | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    setItems(await attachNewsPresentation(data || []));
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => items.filter((item) => (filter === "all" || item.status === filter) && `${item.title} ${item.company_name}`.toLowerCase().includes(search.toLowerCase())), [items, filter, search]);

  async function applyDecision() {
    if (!decision) return;
    if (decision.kind === "reject" && reason.trim().length < 5) { toast.error("Informe o motivo da recusa."); return; }
    setSaving(true);
    const updates = decision.kind === "approve"
      ? { status: "approved", published_at: new Date().toISOString(), rejection_reason: null }
      : decision.kind === "reject"
        ? { status: "rejected", published_at: null, rejection_reason: reason.trim().slice(0, 500) }
        : { status: "pending", published_at: null, rejection_reason: null };
    const { error } = await supabase.from("news").update(updates).eq("id", decision.item.id);
    setSaving(false);
    if (error) { toast.error("Não foi possível atualizar a notícia."); return; }
    toast.success(decision.kind === "approve" ? "Notícia publicada." : decision.kind === "reject" ? "Notícia recusada." : "Notícia retirada de publicação.");
    setDecision(null); setReason(""); void load();
  }

  async function remove(item: NewsItem) {
    const { error } = await supabase.from("news").delete().eq("id", item.id);
    if (error) { toast.error("Não foi possível excluir a notícia."); return; }
    if (item.cover_image_path) await supabase.storage.from("news").remove([item.cover_image_path]);
    toast.success("Notícia excluída."); void load();
  }

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto">{filters.map((option) => <Button key={option.value} size="sm" variant={filter === option.value ? "default" : "outline"} onClick={() => setFilter(option.value)}>{option.label} ({option.value === "all" ? items.length : items.filter((item) => item.status === option.value).length})</Button>)}</div><div className="relative lg:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar título ou empresa..." /></div></div>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : visible.length === 0 ? <div className="rounded-md border border-dashed border-border py-14 text-center text-sm text-muted-foreground">Nenhuma notícia encontrada.</div> : <div className="space-y-3">{visible.map((item) => <article key={item.id} className="rounded-md border border-border bg-card p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant={item.status === "approved" ? "default" : item.status === "rejected" ? "destructive" : "secondary"}>{item.status === "approved" ? "Publicada" : item.status === "rejected" ? "Recusada" : "Aguardando"}</Badge><span className="text-xs text-muted-foreground">{item.category} · {item.company_name}</span></div><h3 className="font-bold text-card-foreground">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>{item.rejection_reason && <p className="mt-2 text-sm text-destructive">Motivo: {item.rejection_reason}</p>}</div><div className="flex flex-wrap gap-2">{item.status === "approved" && <Button size="sm" variant="outline" asChild><Link to={`/noticias/${item.id}`}><Eye className="mr-1 h-4 w-4" /> Ver</Link></Button>}<Button size="sm" variant="outline" onClick={() => setEditing(item)}><Pencil className="mr-1 h-4 w-4" /> Editar</Button>{item.status !== "approved" ? <Button size="sm" onClick={() => setDecision({ item, kind: "approve" })}>Aprovar</Button> : <Button size="sm" variant="outline" onClick={() => setDecision({ item, kind: "unpublish" })}>Retirar</Button>}{item.status !== "rejected" && <Button size="sm" variant="destructive" onClick={() => setDecision({ item, kind: "reject" })}>Recusar</Button>}<Button size="icon" variant="destructive" onClick={() => confirmDelete(() => void remove(item))} title="Excluir"><Trash2 className="h-4 w-4" /></Button></div></div></article>)}</div>}
    <AlertDialog open={!!decision} onOpenChange={(open) => { if (!open && !saving) { setDecision(null); setReason(""); } }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{decision?.kind === "approve" ? "Publicar esta notícia?" : decision?.kind === "reject" ? "Recusar esta notícia?" : "Retirar esta notícia?"}</AlertDialogTitle><AlertDialogDescription>{decision?.kind === "approve" ? "Ela ficará visível para todos no Portal de Notícias." : decision?.kind === "reject" ? "O associado verá o motivo e poderá corrigir e reenviar." : "Ela deixará de aparecer publicamente e voltará para a fila de aprovação."}</AlertDialogDescription></AlertDialogHeader>{decision?.kind === "reject" && <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Informe o motivo da recusa..." rows={4} />}<AlertDialogFooter><AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={(event) => { event.preventDefault(); void applyDecision(); }} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirmar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <NewsFormDialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }} item={editing} onSaved={load} />{ConfirmDialog}
  </div>;
}
