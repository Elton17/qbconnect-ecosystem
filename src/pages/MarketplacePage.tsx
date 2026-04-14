import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ArrowRight, Loader2, Package, Plus, Pencil, Trash2, ImagePlus, X, ChevronLeft, ChevronRight, ShoppingBag, Building2, Tag, Star, Flame, Sparkles, Zap, Crown } from "lucide-react";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PromotionsSection from "@/components/marketplace/PromotionsSection";
import PlanUpgradeModal from "@/components/PlanUpgradeModal";
import PremiumBadge from "@/components/PremiumBadge";
import { usePlanLimits } from "@/hooks/usePlanLimits";

const companyCategories = ["Todos", "Tecnologia", "Construção", "Alimentação", "Saúde", "Serviços", "Indústria", "Educação", "Logística", "Outro"];
const productCategories = ["Todos", "Produtos", "Serviços", "Alimentação", "Tecnologia", "Vestuário", "Saúde", "Educação", "Outro"];

const promoBanners = [
  {
    title: "Ofertas Exclusivas para Associados",
    subtitle: "Descontos de até 30% em produtos e serviços entre empresas da região",
    icon: Flame,
    gradient: "from-primary/90 to-primary/60",
    cta: "Ver Ofertas",
  },
  {
    title: "Novo no Marketplace? Anuncie Grátis!",
    subtitle: "Cadastre seus produtos e serviços e alcance mais de 120 empresas associadas",
    icon: Sparkles,
    gradient: "from-secondary via-secondary/90 to-secondary/70",
    cta: "Começar Agora",
  },
  {
    title: "Oportunidades B2B em Destaque",
    subtitle: "Encontre fornecedores e parceiros para os maiores projetos da região",
    icon: Zap,
    gradient: "from-accent/90 to-primary/80",
    cta: "Explorar",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface Company {
  id: string;
  user_id: string;
  company_name: string;
  segment: string;
  city: string;
  description: string | null;
  logo_url: string | null;
  plan: string;
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function getWhatsAppUrl(phone: string, title: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(`Olá! Vi seu produto *${title}* no QBCAMP Conecta+ e tenho interesse. Podemos conversar?`)}`;
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
  usePageTitle("Marketplace");
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const planLimits = usePlanLimits();
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
  const [promoIndex, setPromoIndex] = useState(0);
  const [isAssociate, setIsAssociate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  // company plan map for product premium sorting
  const [companyPlanMap, setCompanyPlanMap] = useState<Map<string, string>>(new Map());

  // Check if user is an approved associate
  useEffect(() => {
    if (!user) { setIsAssociate(false); return; }
    supabase.from("profiles").select("id").eq("user_id", user.id).eq("approved", true).maybeSingle().then(({ data }) => {
      setIsAssociate(!!data);
    });
  }, [user]);

  // Auto-rotate promo banners
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promoBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Handle edit from product detail page
  useEffect(() => {
    const state = location.state as { editProductId?: string } | null;
    if (state?.editProductId && products.length > 0) {
      const product = products.find(p => p.id === state.editProductId);
      if (product && user && user.id === product.user_id) {
        openEditProduct(product);
        setActiveTab("produtos");
        // Clear the state to avoid re-opening on re-render
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, products, user]);

  async function fetchData() {
    setLoading(true);
    const [companiesRes, productsRes] = await Promise.all([
      supabase.from("profiles").select("id, user_id, company_name, segment, city, description, logo_url, plan").eq("approved", true),
      supabase.from("products").select("*").eq("active", true),
    ]);
    const comps = (companiesRes.data || []) as Company[];
    setCompanies(comps);
    // Build plan map for product premium sorting
    const planMap = new Map<string, string>();
    comps.forEach(c => planMap.set(c.user_id, c.plan));
    setCompanyPlanMap(planMap);
    setProducts((productsRes.data as Product[]) || []);
    setLoading(false);
  }

  const categories = activeTab === "empresas" ? companyCategories : productCategories;

  const filteredCompanies = companies
    .filter((c) => {
      const matchCat = activeCategory === "Todos" || c.segment === activeCategory;
      const matchSearch = c.company_name.toLowerCase().includes(search.toLowerCase()) || c.segment.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => (a.plan === "premium" ? -1 : 0) - (b.plan === "premium" ? -1 : 0));

  const filteredProducts = products
    .filter((p) => {
      const matchCat = activeCategory === "Todos" || p.category === activeCategory;
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      const aPrem = companyPlanMap.get(a.user_id) === "premium" ? -1 : 0;
      const bPrem = companyPlanMap.get(b.user_id) === "premium" ? -1 : 0;
      return aPrem - bPrem;
    });

  function getProductImages(p: Product): string[] {
    if (p.images && p.images.length > 0) return p.images;
    if (p.image_url) return [p.image_url];
    return [];
  }

  function openNewProduct() {
    if (!planLimits.canAddProduct) {
      setUpgradeOpen(true);
      return;
    }
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
    <div>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-secondary py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-primary/60 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-48 w-48 rounded-full bg-accent blur-2xl" />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <ShoppingBag className="h-4 w-4" />
              Marketplace B2B Regional
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl lg:text-6xl">
              Produtos & Serviços dos{" "}
              <span className="text-gradient">Associados</span>
            </h1>
            <p className="mb-8 text-lg text-secondary-foreground/70 md:text-xl">
              Descubra ofertas exclusivas, negocie direto com empresas da região e impulsione seus negócios.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              {isAssociate ? (
                <Button variant="hero" size="xl" onClick={openNewProduct}>
                  <Plus className="mr-1 h-5 w-5" /> Anunciar Produto
                </Button>
              ) : !user ? (
                <Button variant="hero" size="xl" asChild>
                  <a href="https://qbcamp.com.br/filiacao" target="_blank" rel="noopener noreferrer">
                    Comece a Vender <ArrowRight className="ml-1 h-5 w-5" />
                  </a>
                </Button>
              ) : null}
              <Button
                variant="heroOutline"
                size="xl"
                onClick={() => { setActiveTab("produtos"); window.scrollTo({ top: 500, behavior: "smooth" }); }}
              >
                Explorar Ofertas
              </Button>
            </div>
          </motion.div>

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-6"
          >
            {[
              { label: "Empresas", value: `${companies.length}+`, icon: Building2 },
              { label: "Produtos Ativos", value: `${products.length}`, icon: Package },
              { label: "Categorias", value: `${productCategories.length - 1}`, icon: Tag },
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

      {/* Rotating Promo Banner */}
      <section className="border-b border-border">
        <div className="container py-6">
          <div className="relative overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={promoIndex}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`flex items-center gap-6 rounded-2xl bg-gradient-to-r ${promoBanners[promoIndex].gradient} px-6 py-8 md:px-10 md:py-10`}
              >
                <div className="hidden shrink-0 md:flex">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
                    {(() => { const Icon = promoBanners[promoIndex].icon; return <Icon className="h-8 w-8 text-primary-foreground" />; })()}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-xl font-extrabold text-primary-foreground md:text-2xl">
                    {promoBanners[promoIndex].title}
                  </h3>
                  <p className="text-sm text-primary-foreground/80 md:text-base">
                    {promoBanners[promoIndex].subtitle}
                  </p>
                </div>
                <Button
                  variant="heroOutline"
                  size="lg"
                  className="shrink-0 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => { setActiveTab("produtos"); window.scrollTo({ top: 800, behavior: "smooth" }); }}
                >
                  {promoBanners[promoIndex].cta} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            </AnimatePresence>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {promoBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromoIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === promoIndex ? "w-6 bg-primary-foreground" : "w-2 bg-primary-foreground/40"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <PromotionsSection />

      {/* Featured Products */}
      {!loading && products.length > 0 && (
        <section className="border-b border-border bg-muted/30 py-10">
          <div className="container">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-foreground md:text-2xl">Produtos em Destaque</h2>
                  <p className="text-sm text-muted-foreground">Os mais recentes anúncios dos associados</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setActiveTab("produtos"); window.scrollTo({ top: 800, behavior: "smooth" }); }}
              >
                Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 4).map((product, i) => {
                const imgs = getProductImages(product);
                return (
                  <motion.div
                    key={product.id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                  >
                    <Link
                      to={`/produto/${product.id}`}
                      className="group block overflow-hidden rounded-2xl border border-border bg-card card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {imgs.length > 0 ? (
                          <img src={imgs[0]} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute left-3 top-3">
                          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                            Destaque
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-4 pt-10">
                          <span className="text-lg font-extrabold text-primary-foreground">
                            {product.price > 0 ? `R$ ${product.price.toFixed(2).replace(".", ",")}` : "Consulte condições"}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="mb-1 text-sm font-bold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">{product.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description || "Sem descrição"}</p>
                        <div className="mt-3 flex items-center text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Ver detalhes <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="container py-8">
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
                      className={`group rounded-2xl border bg-card p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 ${company.plan === "premium" ? "border-2 border-amber-400" : "border-border"}`}>
                      {company.plan === "premium" && (
                        <div className="mb-3"><PremiumBadge /></div>
                      )}
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
                      className={`group rounded-2xl border bg-card overflow-hidden card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 ${companyPlanMap.get(product.user_id) === "premium" ? "border-2 border-amber-400 relative" : "border-border"}`}>
                      {companyPlanMap.get(product.user_id) === "premium" && (
                        <div className="absolute right-3 top-3 z-10"><PremiumBadge /></div>
                      )}
                      <ProductCarousel images={getProductImages(product)} title={product.title} />
                      <div className="p-5">
                        <div className="mb-2 flex items-start justify-between">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{product.category || "Geral"}</span>
                          <span className="text-lg font-extrabold text-primary">
                            {product.price > 0 ? `R$ ${product.price.toFixed(2).replace(".", ",")}` : "Consulte condições"}
                          </span>
                        </div>
                        <Link to={`/produto/${product.id}`} className="hover:underline">
                          <h3 className="mb-1 text-base font-bold text-card-foreground">{product.title}</h3>
                        </Link>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{product.description || "Sem descrição"}</p>
                        <div className="flex gap-2">
                          {product.contact_phone && (
                            <a href={getWhatsAppUrl(product.contact_phone, product.title)} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="whatsapp" className="w-full">
                                <WhatsAppIcon className="mr-1 h-3.5 w-3.5" /> Consultar via WhatsApp
                              </Button>
                            </a>
                          )}
                        </div>
                        {user && user.id === product.user_id && (
                          <div className="mt-3 flex gap-2 border-t border-border pt-3">
                            <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEditProduct(product)}>
                              <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => confirmDelete(() => handleDeleteProduct(product.id))}>
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
      {ConfirmDialog}
      <PlanUpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} resourceType="produtos" currentLimit={planLimits.limits.products} />
    </div>
  );
}
