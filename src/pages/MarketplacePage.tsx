import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ArrowRight, Loader2, Package, Plus, MessageCircle, Mail, Pencil, Trash2, ImagePlus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const companyCategories = ["Todos", "Tecnologia", "Construção", "Alimentação", "Saúde", "Serviços", "Indústria", "Educação", "Logística", "Outro"];
const productCategories = ["Todos", "Produtos", "Serviços", "Alimentação", "Tecnologia", "Vestuário", "Saúde", "Educação", "Outro"];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface Company {
  id: string;
  company_name: string;
  segment: string;
  city: string;
  description: string | null;
  logo_url: string | null;
}

interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  images: string[];
  contact_phone: string;
  contact_email: string;
  active: boolean;
}

// Mini carousel for product cards
function ProductCarousel({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const hasMultiple = images.length > 1;

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-muted flex items-center justify-center">
        <Package className="h-12 w-12 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-muted overflow-hidden group/carousel">
      <img src={images[current]} alt={title} className="h-full w-full object-cover" />
      {hasMultiple && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-1 opacity-0 transition-opacity group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-1 opacity-0 transition-opacity group-hover/carousel:opacity-100"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <span key={idx} className={`h-1.5 w-1.5 rounded-full transition-colors ${idx === current ? "bg-primary" : "bg-card/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("empresas");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "", contact_phone: "", contact_email: "" });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [companiesRes, productsRes] = await Promise.all([
      supabase.from("profiles").select("id, company_name, segment, city, description, logo_url").eq("approved", true),
      supabase.from("products").select("*").eq("active", true),
    ]);
    setCompanies(companiesRes.data || []);
    setProducts((productsRes.data as Product[]) || []);
    setLoading(false);
  }

  const categories = activeTab === "empresas" ? companyCategories : productCategories;

  const filteredCompanies = companies.filter((c) => {
    const matchCat = activeCategory === "Todos" || c.segment === activeCategory;
    const matchSearch = c.company_name.toLowerCase().includes(search.toLowerCase()) || c.segment.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function getProductImages(p: Product): string[] {
    if (p.images && p.images.length > 0) return p.images;
    if (p.image_url) return [p.image_url];
    return [];
  }

  function openNewProduct() {
    setEditingProduct(null);
    setForm({ title: "", description: "", price: "", category: "", contact_phone: "", contact_email: "" });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setDialogOpen(true);
  }

  function openEditProduct(p: Product) {
    setEditingProduct(p);
    setForm({ title: p.title, description: p.description, price: String(p.price), category: p.category, contact_phone: p.contact_phone, contact_email: p.contact_email });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages(getProductImages(p));
    setDialogOpen(true);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + imagePreviews.length + files.length;
    if (totalImages > 6) {
      toast({ title: "Máximo de 6 imagens por produto", variant: "destructive" });
      return;
    }
    const validFiles = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast({ title: `${f.name} é muito grande (máx. 5MB)`, variant: "destructive" });
        return false;
      }
      return true;
    });
    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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

  async function handleSaveProduct() {
    if (!user) return;
    if (!form.title || !form.price) {
      toast({ title: "Preencha título e preço", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const newUrls = await uploadImages();
      const allImages = [...existingImages, ...newUrls];

      const payload = {
        user_id: user.id,
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        image_url: allImages[0] || "",
        images: allImages,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
        active: true,
      };

      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) { toast({ title: "Erro ao atualizar", variant: "destructive" }); return; }
        toast({ title: "Produto atualizado!" });
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) { toast({ title: "Erro ao cadastrar", variant: "destructive" }); return; }
        toast({ title: "Produto cadastrado!" });
      }
      setDialogOpen(false);
      fetchData();
    } catch {
      toast({ title: "Erro ao enviar imagens", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Produto removido" });
    fetchData();
  }

  const allPreviews = [...existingImages, ...imagePreviews];
  const canAddMore = allPreviews.length < 6;

  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold text-foreground">Marketplace</h1>
            <p className="text-muted-foreground">Encontre empresas, produtos e serviços dos associados.</p>
          </div>
          {user && (
            <Button onClick={openNewProduct}>
              <Plus className="mr-1 h-4 w-4" /> Anunciar Produto
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setActiveCategory("Todos"); }}>
          <TabsList className="mb-6">
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="produtos">Produtos & Serviços</TabsTrigger>
          </TabsList>

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
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
          ) : (
            <>
              <TabsContent value="empresas">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCompanies.map((company, i) => (
                    <motion.div key={company.id} custom={i} initial="hidden" animate="visible" variants={fadeInUp}
                      className="group rounded-2xl border border-border bg-card p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary overflow-hidden">
                          {company.logo_url ? <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" /> : company.company_name.charAt(0)}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{company.segment}</span>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-card-foreground">{company.company_name}</h3>
                      <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{company.description || "Sem descrição"}</p>
                      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{company.city || "—"}</span>
                      </div>
                      <Link to={`/empresa/${company.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full">Ver perfil <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                {filteredCompanies.length === 0 && <div className="py-16 text-center text-muted-foreground">Nenhuma empresa encontrada.</div>}
              </TabsContent>

              <TabsContent value="produtos">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product, i) => (
                    <motion.div key={product.id} custom={i} initial="hidden" animate="visible" variants={fadeInUp}
                      className="group rounded-2xl border border-border bg-card overflow-hidden card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1">
                      <ProductCarousel images={getProductImages(product)} title={product.title} />
                      <div className="p-5">
                        <div className="mb-2 flex items-start justify-between">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{product.category || "Geral"}</span>
                          <span className="text-lg font-extrabold text-primary">
                            {product.price > 0 ? `R$ ${product.price.toFixed(2).replace(".", ",")}` : "Sob consulta"}
                          </span>
                        </div>
                        <Link to={`/produto/${product.id}`} className="hover:underline">
                          <h3 className="mb-1 text-base font-bold text-card-foreground">{product.title}</h3>
                        </Link>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{product.description || "Sem descrição"}</p>
                        <div className="flex gap-2">
                          {product.contact_phone && (
                            <a href={`https://api.whatsapp.com/send?phone=55${product.contact_phone.replace(/\D/g, "")}&text=Olá! Vi seu produto "${product.title}" no Marketplace QBCAMP.`} target="_blank" rel="noopener noreferrer" className="flex-1">
                              <Button variant="default" size="sm" className="w-full"><MessageCircle className="mr-1 h-3.5 w-3.5" /> WhatsApp</Button>
                            </a>
                          )}
                          {product.contact_email && (
                            <a href={`mailto:${product.contact_email}?subject=Interesse no produto: ${product.title}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full"><Mail className="mr-1 h-3.5 w-3.5" /> Email</Button>
                            </a>
                          )}
                        </div>
                        {user && user.id === product.user_id && (
                          <div className="mt-3 flex gap-2 border-t border-border pt-3">
                            <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEditProduct(product)}>
                              <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {filteredProducts.length === 0 && (
                  <div className="py-16 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                    <p className="text-muted-foreground">Nenhum produto encontrado.</p>
                    {user && <Button className="mt-4" onClick={openNewProduct}><Plus className="mr-1 h-4 w-4" /> Anunciar primeiro produto</Button>}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Product Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Anunciar Produto"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Título *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome do produto ou serviço" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Descrição</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva seu produto" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Preço (R$) *</label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0,00" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Categoria</label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {productCategories.filter(c => c !== "Todos").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Multi-image upload */}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Imagens do Produto (até 6)</label>
                <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageSelect} className="hidden" />

                {allPreviews.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {existingImages.map((url, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => removeExistingImage(idx)}
                          className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {idx === 0 && <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">Capa</span>}
                      </div>
                    ))}
                    {imagePreviews.map((url, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary/40">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => removeNewImage(idx)}
                          className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Nova</span>
                      </div>
                    ))}
                  </div>
                )}

                {canAddMore && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted/50 py-6 transition-colors hover:border-primary/50 hover:bg-muted"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-sm">
                        {allPreviews.length === 0 ? "Clique para adicionar imagens" : "Adicionar mais imagens"}
                      </span>
                      <span className="text-xs">JPG, PNG ou WebP (máx. 5MB cada) · {allPreviews.length}/6</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">WhatsApp</label>
                  <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="41999999999" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Email de contato</label>
                  <Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="email@empresa.com" />
                </div>
              </div>
              <Button onClick={handleSaveProduct} disabled={uploading} className="w-full">
                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : editingProduct ? "Salvar alterações" : "Publicar anúncio"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
