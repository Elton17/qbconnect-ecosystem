import { useState, useRef, useEffect } from "react";
import { formatPhone } from "@/lib/masks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const productCategories = ["Alimentação", "Automotivo", "Casa e construção", "Educação", "Indústria", "Saúde e beleza", "Tecnologia", "Vestuário", "Outro"];

interface ProductData {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  images: string[] | null;
  image_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  price_type: string;
  product_type: string;
  city: string | null;
  installment_count: number;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: ProductData | null;
  onSaved: () => void;
  initialType?: "product" | "service";
}

interface ProductFormState {
  title: string;
  description: string;
  price: string;
  category: string;
  contact_phone: string;
  contact_email: string;
  price_type: string;
  product_type: string;
  city: string;
  installment_count: string;
}

export default function ProductFormDialog({ open, onOpenChange, product, onSaved, initialType = "product" }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormState>({
    title: "", description: "", price: "", category: "", contact_phone: "", contact_email: "",
    price_type: "fixed", product_type: initialType, city: "", installment_count: "1",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      const imgs = (product.images && product.images.length > 0) ? product.images : product.image_url ? [product.image_url] : [];
      setForm({
        title: product.title || "",
        description: product.description || "",
        price: String(product.price || ""),
        category: product.category || "",
        contact_phone: product.contact_phone || "",
        contact_email: product.contact_email || "",
        price_type: product.price_type || "fixed",
        product_type: product.product_type || "product",
        city: product.city || "",
        installment_count: String(product.installment_count || 1),
      });
      setExistingImages(imgs);
    } else {
      setForm({ title: "", description: "", price: "", category: "", contact_phone: "", contact_email: "", price_type: "fixed", product_type: initialType, city: "", installment_count: "1" });
      setExistingImages([]);
      // Pre-fill city from profile
      if (user) {
        supabase.from("profiles").select("city, contact_phone").eq("user_id", user.id).maybeSingle().then(({ data }) => {
          if (data) {
            setForm(f => ({ ...f, city: data.city || "", contact_phone: f.contact_phone || data.contact_phone || "" }));
          }
        });
      }
    }
    setImageFiles([]);
    setImagePreviews([]);
  }, [product, open, user, initialType]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + imagePreviews.length + files.length;
    if (total > 5) { toast({ title: "Máximo de 5 imagens", variant: "destructive" }); return; }
    const valid = files.filter(f => { if (f.size > 5 * 1024 * 1024) { toast({ title: `${f.name} muito grande (máx 5MB)`, variant: "destructive" }); return false; } return true; });
    setImageFiles(prev => [...prev, ...valid]);
    setImagePreviews(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadImages(): Promise<string[]> {
    if (!user) return [];
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("products").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("products").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function handleSave() {
    if (!user || !form.title) { toast({ title: "Preencha o título", variant: "destructive" }); return; }
    setUploading(true);
    try {
      if (!product) {
        const { count, error: countError } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("active", true);
        if (countError) throw countError;
        if ((count || 0) >= 5) {
          toast({ title: "Limite de anúncios atingido", description: "Sua empresa já possui 5 produtos ou serviços ativos.", variant: "destructive" });
          return;
        }
      }
      const newUrls = await uploadImages();
      const allImages = [...existingImages, ...newUrls];
      const payload = {
        user_id: user.id,
        title: form.title,
        description: form.description,
        price: parseFloat(form.price) || 0,
        category: form.category,
        image_url: allImages[0] || "",
        images: allImages,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
        price_type: form.price_type,
        product_type: form.product_type,
        city: form.city,
        installment_count: form.price_type === "consult" ? 1 : Math.max(1, Math.min(36, Number(form.installment_count) || 1)),
        active: true,
        moderation_status: "approved",
      };
      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id).eq("user_id", user.id);
        if (error) { toast({ title: "Erro ao atualizar", variant: "destructive" }); return; }
        toast({ title: "Anúncio atualizado e publicado!" });
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) {
          const limitReached = error.message.includes("Limite de 5 anúncios");
          toast({ title: limitReached ? "Limite de anúncios atingido" : "Erro ao cadastrar", description: limitReached ? "Sua empresa já possui 5 produtos ou serviços ativos." : undefined, variant: "destructive" });
          return;
        }
        toast({ title: "Anúncio publicado com sucesso!" });
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const limitReached = message.includes("Limite de 5 anúncios");
      toast({ title: limitReached ? "Limite de anúncios atingido" : "Não foi possível salvar o anúncio", description: limitReached ? "Sua empresa já possui 5 produtos ou serviços ativos." : undefined, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  const allPreviews = [...existingImages, ...imagePreviews];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Anunciar Produto"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {/* Tipo de produto */}
          <div>
            <Label className="mb-2 block text-sm font-medium">Tipo de produto</Label>
            <RadioGroup value={form.product_type} onValueChange={(v) => setForm({ ...form, product_type: v })} className="flex gap-4">
              {[{ v: "product", l: "Produto físico" }, { v: "service", l: "Serviço" }, { v: "plan", l: "Plano corporativo" }].map(o => (
                <div key={o.v} className="flex items-center gap-1.5">
                  <RadioGroupItem value={o.v} id={`ptype-${o.v}`} />
                  <Label htmlFor={`ptype-${o.v}`} className="text-sm cursor-pointer">{o.l}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium">Título *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome do produto ou serviço" />
          </div>
          <div>
            <Label className="mb-1 block text-sm font-medium">Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva seu produto" rows={3} />
          </div>

          {/* Tipo de preço */}
          <div>
            <Label className="mb-2 block text-sm font-medium">Tipo de preço</Label>
            <RadioGroup value={form.price_type} onValueChange={(v) => setForm({ ...form, price_type: v })} className="flex gap-4">
              {[{ v: "fixed", l: "Preço fixo" }, { v: "negotiable", l: "Negociável" }, { v: "consult", l: "Consultar" }].map(o => (
                <div key={o.v} className="flex items-center gap-1.5">
                  <RadioGroupItem value={o.v} id={`price-${o.v}`} />
                  <Label htmlFor={`price-${o.v}`} className="text-sm cursor-pointer">{o.l}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block text-sm font-medium">Preço (R$)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0,00" />
            </div>
            <div>
              <Label className="mb-1 block text-sm font-medium">Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {productCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.price_type !== "consult" && Number(form.price) > 0 && (
            <div>
              <Label className="mb-1 block text-sm font-medium">Parcelamento</Label>
              <Select value={form.installment_count} onValueChange={(v) => setForm({ ...form, installment_count: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Array.from({ length: 36 }, (_, index) => index + 1).map((count) => <SelectItem key={count} value={String(count)}>{count === 1 ? "À vista" : `${count}x de aproximadamente R$ ${(Number(form.price) / count).toFixed(2).replace(".", ",")}`}</SelectItem>)}</SelectContent>
              </Select>
              {Number(form.installment_count) > 1 && <p className="mt-1 text-xs text-muted-foreground">Valor total: R$ {Number(form.price).toFixed(2).replace(".", ",")}</p>}
            </div>
          )}

          <div>
            <Label className="mb-1 block text-sm font-medium">Cidade</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cidade do vendedor" />
          </div>

          {/* Images */}
          <div>
            <Label className="mb-1 block text-sm font-medium">Imagens (até 5)</Label>
            <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
            {allPreviews.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2">
                {existingImages.map((url, idx) => (
                  <div key={`e-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => setExistingImages(p => p.filter((_, i) => i !== idx))} className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"><X className="h-3 w-3" /></button>
                    {idx === 0 && <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">Capa</span>}
                  </div>
                ))}
                {imagePreviews.map((url, idx) => (
                  <div key={`n-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary/40">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => { setImageFiles(p => p.filter((_, i) => i !== idx)); setImagePreviews(p => p.filter((_, i) => i !== idx)); }} className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
            {allPreviews.length < 5 && (
              <div onClick={() => fileInputRef.current?.click()} className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted/50 py-6 hover:border-primary/50 hover:bg-muted transition-colors">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-sm">{allPreviews.length === 0 ? "Adicionar imagens" : "Adicionar mais"}</span>
                  <span className="text-xs">{allPreviews.length}/5</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block text-sm font-medium">WhatsApp</Label>
              <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: formatPhone(e.target.value) })} placeholder="(41) 99999-0000" />
            </div>
            <div>
              <Label className="mb-1 block text-sm font-medium">Email de contato</Label>
              <Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="email@empresa.com" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={uploading} className="w-full">
            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : product ? "Salvar alterações" : "Publicar anúncio"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
