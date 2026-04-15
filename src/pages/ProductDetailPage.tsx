import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { motion } from "framer-motion";
import {
  Loader2, Package, ChevronLeft, ChevronRight, MapPin, Building2,
  Eye, MessageCircle, Star, Pencil, Trash2, Share2, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ProductCard, { type ProductWithSeller } from "@/components/marketplace/ProductCard";

interface Product {
  id: string; user_id: string; title: string; description: string | null; price: number;
  category: string | null; image_url: string | null; images: string[] | null;
  contact_phone: string | null; contact_email: string | null;
  view_count: number; contact_count: number; price_type: string; product_type: string; city: string | null;
  created_at: string | null;
}

interface Seller {
  id: string; company_name: string; segment: string; city: string; logo_url: string | null;
  phone: string; website: string | null; plan: string; contact_phone: string;
}

interface Review {
  id: string; product_id: string; reviewer_user_id: string; rating: number;
  comment: string | null; created_at: string;
  reviewer_name?: string;
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

function StarRating({ rating, onChange, interactive = false }: { rating: number; onChange?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={`h-5 w-5 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "hoje";
  if (days === 1) return "há 1 dia";
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? "há 1 mês" : `há ${months} meses`;
}

function isNew(createdAt: string | null) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 7 * 86400000;
}

const typeLabels: Record<string, string> = { product: "Produto", service: "Serviço", plan: "Plano" };

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [otherProducts, setOtherProducts] = useState<ProductWithSeller[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const isOwner = user && product && user.id === product.user_id;

  async function handleDelete() {
    if (!product) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) { toast({ title: "Erro ao remover", variant: "destructive" }); return; }
    toast({ title: "Produto removido" });
    navigate("/marketplace");
  }

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copiado!" });
  }

  async function handleWhatsAppClick() {
    if (product) {
      try { await supabase.rpc("increment_product_contact", { p_id: product.id }); } catch {}
    }
  }

  async function submitReview() {
    if (!user || !product || newRating === 0) { toast({ title: "Selecione uma nota", variant: "destructive" }); return; }
    setSubmittingReview(true);
    const { error } = await supabase.from("product_reviews").upsert({
      product_id: product.id, reviewer_user_id: user.id, rating: newRating, comment: newComment,
    }, { onConflict: "product_id,reviewer_user_id" });
    if (error) { toast({ title: "Erro ao enviar avaliação", variant: "destructive" }); }
    else { toast({ title: "Avaliação enviada!" }); setNewRating(0); setNewComment(""); loadReviews(product.id); }
    setSubmittingReview(false);
  }

  async function loadReviews(productId: string) {
    const { data } = await supabase.from("product_reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false }).limit(10);
    if (!data) return;
    // Get reviewer names
    const userIds = [...new Set(data.map(r => r.reviewer_user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, company_name").in("user_id", userIds);
    const nameMap = new Map((profiles || []).map(p => [p.user_id, p.company_name]));
    setReviews(data.map(r => ({ ...r, reviewer_name: nameMap.get(r.reviewer_user_id) || "Usuário" })));
  }

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      const { data: prod } = await supabase.from("products").select("*").eq("id", id).eq("active", true).single();
      if (!prod) { setLoading(false); return; }
      setProduct(prod as Product);
      setSelectedImage(0);

      // Increment view
      try { await supabase.rpc("increment_product_view", { p_id: id }); } catch {}

      // Seller
      const { data: profiles } = await supabase.from("profiles").select("id, company_name, segment, city, logo_url, phone, plan, contact_phone, website").eq("user_id", prod.user_id).eq("approved", true).limit(1);
      const sellerData = profiles && profiles.length > 0 ? profiles[0] as Seller : null;
      setSeller(sellerData);

      // Reviews
      await loadReviews(id);

      // Other products from seller
      const { data: others } = await supabase.from("products").select("*").eq("user_id", prod.user_id).eq("active", true).neq("id", id).limit(4);
      setOtherProducts((others || []).map((p: any) => ({
        ...p, view_count: p.view_count || 0, contact_count: p.contact_count || 0,
        price_type: p.price_type || "fixed", product_type: p.product_type || "product",
        seller_name: sellerData?.company_name, seller_city: sellerData?.city, seller_plan: sellerData?.plan,
        seller_logo: sellerData?.logo_url, seller_segment: sellerData?.segment,
      })));

      // Related products (same category, different seller)
      if (prod.category) {
        const { data: related } = await supabase.from("products").select("*").eq("active", true).eq("category", prod.category).neq("user_id", prod.user_id).limit(6);
        // Enrich related with seller data (simplified)
        setRelatedProducts((related || []).map((p: any) => ({
          ...p, view_count: p.view_count || 0, contact_count: p.contact_count || 0,
          price_type: p.price_type || "fixed", product_type: p.product_type || "product",
        })));
      }

      setLoading(false);
    }
    load();
  }, [id]);

  // Check if user is approved
  useEffect(() => {
    if (!user) { setIsApproved(false); return; }
    supabase.from("profiles").select("id").eq("user_id", user.id).eq("approved", true).maybeSingle().then(({ data }) => setIsApproved(!!data));
  }, [user]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
        <h2 className="mb-2 text-2xl font-bold text-foreground">Produto não encontrado</h2>
        <Link to="/marketplace"><Button variant="outline">Voltar ao Marketplace</Button></Link>
      </div>
    );
  }

  const images = (product.images && product.images.length > 0) ? product.images : product.image_url ? [product.image_url] : [];
  const whatsappPhone = product.contact_phone || seller?.contact_phone || seller?.phone || "";
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const isPremium = seller?.plan === "premium";

  return (
    <div className="container py-8">
      <Breadcrumbs items={[
        { label: "Marketplace", href: "/marketplace" },
        ...(product.category ? [{ label: product.category }] : []),
        { label: product.title },
      ]} />

      <div className="grid gap-8 lg:grid-cols-[55%_45%]">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="relative mb-3 overflow-hidden rounded-xl border border-border bg-muted" style={{ height: 420 }}>
            {images.length > 0 ? (
              <img src={images[selectedImage]} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center"><Package className="h-20 w-20 text-muted-foreground/30" /></div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setSelectedImage(s => (s - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 shadow hover:bg-card">
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <button onClick={() => setSelectedImage(s => (s + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 shadow hover:bg-card">
                  <ChevronRight className="h-5 w-5 text-foreground" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${idx === selectedImage ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/40"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{typeLabels[product.product_type] || "Produto"}</Badge>
            {isNew(product.created_at) && <Badge className="animate-pulse">NOVO</Badge>}
            {isPremium && <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-400"><Star className="mr-1 h-3 w-3 fill-amber-900" />Premium</Badge>}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>

          {/* Price */}
          <div>
            {product.price_type === "consult" ? (
              <span className="text-xl text-muted-foreground">Consulte o vendedor</span>
            ) : (
              <>
                <span className="text-3xl font-black text-primary">
                  {product.price > 0 ? `R$ ${product.price.toFixed(2).replace(".", ",")}` : "Consultar preço"}
                </span>
                {product.price_type === "negotiable" && <span className="ml-2 text-sm text-muted-foreground">Preço negociável</span>}
              </>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{product.view_count} visualizações</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{product.contact_count} consultas</span>
            {(product.city || seller?.city) && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{product.city || seller?.city}</span>}
          </div>

          {/* Seller card */}
          {seller && (
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary overflow-hidden">
                  {seller.logo_url ? <img src={seller.logo_url} alt="" className="h-full w-full object-cover" /> : seller.company_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-card-foreground truncate">{seller.company_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{isPremium ? "Premium" : "Associado"}</Badge>
                    {seller.city && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{seller.city}</span>}
                  </div>
                </div>
              </div>
              <Link to={`/empresa/${seller.id}`} className="mt-3 block">
                <Button variant="ghost" size="sm" className="w-full"><Building2 className="mr-1 h-4 w-4" />Ver perfil completo</Button>
              </Link>
            </div>
          )}

          {/* WhatsApp CTA */}
          {whatsappPhone ? (
            <a href={getWhatsAppUrl(whatsappPhone, product.title)} target="_blank" rel="noopener noreferrer" onClick={handleWhatsAppClick}>
              <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-6 py-4 text-white font-bold text-lg shadow-lg transition-all hover:bg-[#1ea952] hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]">
                <WhatsAppIcon className="h-6 w-6" />
                <div className="flex flex-col items-start">
                  <span>Falar com o vendedor</span>
                  <span className="text-xs font-normal opacity-90">Resposta rápida via WhatsApp</span>
                </div>
              </button>
            </a>
          ) : (
            <div className="rounded-xl border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
              Contato não disponível.
            </div>
          )}

          {/* Share */}
          <Button variant="outline" className="w-full" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar produto
          </Button>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex gap-2 border-t border-border pt-4">
              <Link to="/marketplace" state={{ editProductId: product.id }} className="flex-1">
                <Button variant="outline" size="lg" className="w-full"><Pencil className="mr-2 h-4 w-4" />Editar</Button>
              </Link>
              <Button variant="outline" size="lg" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => confirmDelete(handleDelete)}>
                <Trash2 className="mr-2 h-4 w-4" />Excluir
              </Button>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <h3 className="mb-2 font-semibold text-foreground">Sobre este {typeLabels[product.product_type]?.toLowerCase() || "produto"}</h3>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{product.description || "Sem descrição."}</p>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-foreground flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          Avaliações
          {reviews.length > 0 && <span className="text-base font-normal text-muted-foreground">({avgRating.toFixed(1)} · {reviews.length} avaliação{reviews.length !== 1 ? "es" : ""})</span>}
        </h2>

        {reviews.length > 0 && (
          <div className="mb-6 space-y-4">
            {reviews.slice(0, 5).map(r => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{(r.reviewer_name || "U").charAt(0)}</div>
                    <span className="text-sm font-medium text-foreground">{r.reviewer_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</span>
                </div>
                <StarRating rating={r.rating} />
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {user && isApproved && !isOwner && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h4 className="mb-3 text-sm font-semibold">Deixe sua avaliação</h4>
            <StarRating rating={newRating} onChange={setNewRating} interactive />
            <Textarea className="mt-3" placeholder="Comentário (opcional)" value={newComment} onChange={e => setNewComment(e.target.value)} rows={2} />
            <Button className="mt-3" disabled={submittingReview || newRating === 0} onClick={submitReview}>
              {submittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Enviar avaliação
            </Button>
          </div>
        )}

        {!user && (
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Faça login</Link> para avaliar este produto.
          </p>
        )}
      </section>

      {/* Other products from seller */}
      {otherProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Outros produtos de {seller?.company_name || "este vendedor"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-foreground">Você também pode gostar</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {ConfirmDialog}
    </div>
  );
}
