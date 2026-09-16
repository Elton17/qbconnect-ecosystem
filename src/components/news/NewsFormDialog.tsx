import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { NEWS_CATEGORIES, type NewsItem } from "@/lib/news";

const schema = z.object({
  title: z.string().trim().min(5, "Informe um título com pelo menos 5 caracteres.").max(160),
  summary: z.string().trim().min(20, "O resumo deve ter pelo menos 20 caracteres.").max(320),
  content: z.string().trim().min(50, "O conteúdo deve ter pelo menos 50 caracteres.").max(20000),
  category: z.string().trim().min(2, "Selecione uma categoria.").max(60),
});

type Props = { open: boolean; onOpenChange: (open: boolean) => void; item?: NewsItem | null; onSaved: () => void; adminMode?: boolean };

export default function NewsFormDialog({ open, onOpenChange, item, onSaved, adminMode = false }: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: "", summary: "", content: "", category: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(item ? { title: item.title, summary: item.summary, content: item.content, category: item.category } : { title: "", summary: "", content: "", category: "" });
    setPreview(item?.cover_url || null);
    setFile(null);
    setErrors({});
  }, [item, open]);

  function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) { toast.error("Selecione um arquivo de imagem."); return; }
    if (selected.size > 5 * 1024 * 1024) { toast.error("A imagem deve ter no máximo 5 MB."); return; }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function save() {
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { next[String(issue.path[0])] = issue.message; });
      setErrors(next);
      return;
    }
    setSaving(true);
    try {
      const { data: profile, error: profileError } = await supabase.from("profiles").select("id, approved").eq("user_id", user.id).maybeSingle();
      if (!adminMode && (profileError || !profile?.approved)) throw new Error("Somente empresas aprovadas podem enviar notícias.");
      if (!item && !profile) throw new Error("Perfil da empresa não encontrado.");

      let coverPath = item?.cover_image_path || null;
      if (file) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        coverPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from("news").upload(coverPath, file, { contentType: file.type });
        if (error) throw error;
      }

      const payload = {
        ...parsed.data,
        user_id: item?.user_id || user.id,
        profile_id: item?.profile_id || profile?.id || "",
        cover_image_path: coverPath,
        status: "approved",
        rejection_reason: null,
        published_at: item?.published_at || new Date().toISOString(),
      };
      const response = item
        ? await supabase.from("news").update(payload).eq("id", item.id)
        : await supabase.from("news").insert({ ...payload, title: parsed.data.title, summary: parsed.data.summary, content: parsed.data.content, category: parsed.data.category });
      if (response.error) throw response.error;
      toast.success(item ? "Notícia atualizada e publicada." : "Notícia publicada com sucesso.");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a notícia.");
    } finally { setSaving(false); }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
      <DialogHeader><DialogTitle>{item ? "Editar notícia" : "Enviar notícia"}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <Field label="Título" error={errors.title}><Input value={form.title} maxLength={160} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Resumo" error={errors.summary}><Textarea value={form.summary} maxLength={320} rows={3} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></Field>
        <Field label="Categoria" error={errors.category}>
          <Select value={form.category} onValueChange={(category) => setForm({ ...form, category })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{NEWS_CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select>
        </Field>
        <Field label="Conteúdo completo" error={errors.content}><Textarea value={form.content} maxLength={20000} rows={12} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Escreva a notícia em parágrafos..." /></Field>
        <div><Label className="mb-2 block">Imagem de capa</Label><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={chooseFile} />
          {preview ? <div className="relative aspect-[16/7] overflow-hidden rounded-md border border-border"><img src={preview} alt="Prévia da capa" className="h-full w-full object-cover" /><Button type="button" variant="destructive" size="icon" className="absolute right-2 top-2" onClick={() => { setFile(null); setPreview(null); }}><X className="h-4 w-4" /></Button></div> : <Button type="button" variant="outline" className="w-full" onClick={() => inputRef.current?.click()}><ImagePlus className="mr-2 h-4 w-4" /> Selecionar imagem</Button>}
        </div>
        <Button className="w-full" onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{item ? "Salvar alterações" : "Publicar notícia"}</Button>
      </div>
    </DialogContent>
  </Dialog>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><Label className="mb-1.5 block">{label} *</Label>{children}{error && <p className="mt-1 text-xs text-destructive">{error}</p>}</div>;
}
