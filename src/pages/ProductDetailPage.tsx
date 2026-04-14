import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Package, ChevronLeft, ChevronRight,
  MapPin, Phone, Globe, Building2, ShoppingBag, Tag, Pencil, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

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
}

interface Seller {
  company_name: string;
  segment: string;
  city: string;
  logo_url: string | null;
  phone: string;
  email: string;
  website: string | null;
  description: string | null;
  id: string;
  contact_phone: string;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function getWhatsAppUrl(phone: string, productTitle: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const message = encodeURIComponent(`Olá! Vi seu produto *${productTitle}* no QBCAMP Conecta+ e tenho interesse. Podemos conversar?`);
  return `https://wa.me/${fullPhone}?text=${message}`;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const isOwner = user && product && user.id === product.user_id;

  async function handleDelete() {
    if (!product) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      toast({ title: "Erro ao remover produto", variant: "destructive" });
      return;
    }
    toast({ title: "Produto removido com sucesso" });
    navigate("/marketplace");
  }

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      const { data: prod } = await supabase.from("products").select("*").eq("id", id).eq("active", true).single();
      if (!prod) { setLoading(false); return; }
      setProduct(prod as Product);
      setSelectedImage(0);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, company_name, segment, city, logo_url, phone, email, website, description, contact_phone")
        .eq("user_id", prod.user_id)
        .eq("approved", true)
        .limit(1);

      if (profiles && profiles.length > 0) setSeller(profiles[0] as Seller);

      const { data: others } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", prod.user_id)
        .eq("active", true)
        .neq("id", id)
        .limit(4);
      setOtherProducts((others as Product[]) || []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
        <h2 className="mb-2 text-2xl font-bold text-foreground">Produto não encontrado</h2>
        <p className="mb-6 text-muted-foreground">Este produto não existe ou foi removido.</p>
        <Link to="/marketplace"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Marketplace</Button></Link>
      </div>
    );
  }

  const images = (product.images && product.images.length > 0) ? product.images : product.image_url ? [product.image_url] : [];

  // Determine WhatsApp number: product contact_phone → seller contact_phone → seller phone
  const whatsappPhone = product.contact_phone || seller?.contact_phone || seller?.phone || "";

  return (
    <div className="container py-8">
      <Breadcrumbs items={[
        { label: "Marketplace", href: "/marketplace" },
        { label: product.title },
      ]} />

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Gallery — 3 cols */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
          <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
            {images.length > 0 ? (
              <img src={images[selectedImage]} alt={product.title} className="h-full w-full object-contain bg-card" />
            ) : (
              <div className="flex h-full items-center justify-center"><Package className="h-20 w-20 text-muted-foreground/30" /></div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((s) => (s - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 shadow transition-colors hover:bg-card"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <button
                  onClick={() => setSelectedImage((s) => (s + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 shadow transition-colors hover:bg-card"
                >
                  <ChevronRight className="h-5 w-5 text-foreground" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    idx === selectedImage ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product info — 2 cols */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-3 flex flex-wrap gap-2">
              {product.category && (
                <Badge variant="outline" className="gap-1"><Tag className="h-3 w-3" />{product.category}</Badge>
              )}
            </div>

            <h1 className="mb-3 text-2xl font-extrabold text-foreground">{product.title}</h1>

            <div className="mb-4">
              <span className="text-3xl font-extrabold text-primary">
                {product.price > 0
                  ? `R$ ${product.price.toFixed(2).replace(".", ",")}`
                  : "Consulte condições"}
              </span>
              {product.price > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">a partir de</span>
              )}
            </div>

            <Separator className="my-4" />

            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Descrição</h3>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {product.description || "Sem descrição disponível."}
              </p>
            </div>

            {/* WhatsApp CTA */}
            {whatsappPhone ? (
              <a
                href={getWhatsAppUrl(whatsappPhone, product.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <button
                  className="flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-white font-bold text-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <WhatsAppIcon className="h-6 w-6" />
                  <div className="flex flex-col items-start">
                    <span>Falar com o vendedor</span>
                    <span className="text-xs font-normal opacity-90">Resposta rápida via WhatsApp</span>
                  </div>
                </button>
              </a>
            ) : (
              <div className="rounded-xl border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
                Contato não disponível. Visite o perfil da empresa para mais informações.
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="mt-4 flex gap-2 border-t border-border pt-4">
                <Link to="/marketplace" state={{ editProductId: product.id }} className="flex-1">
                  <Button variant="outline" size="lg" className="w-full">
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => confirmDelete(handleDelete)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </Button>
              </div>
            )}
          </div>

          {/* Seller card */}
          {seller && (
            <div className="mt-4 rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vendedor</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary overflow-hidden">
                  {seller.logo_url ? (
                    <img src={seller.logo_url} alt={seller.company_name} className="h-full w-full object-cover" />
                  ) : (
                    seller.company_name.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-card-foreground truncate">{seller.company_name}</p>
                  <p className="text-xs text-muted-foreground">{seller.segment}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {seller.city && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" />{seller.city}</span>}
                {seller.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" />{seller.phone}</span>}
                {seller.website && (
                  <a href={seller.website.startsWith("http") ? seller.website : `https://${seller.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                    <Globe className="h-3.5 w-3.5 shrink-0" />{seller.website}
                  </a>
                )}
              </div>

              <Link to={`/empresa/${seller.id}`} className="mt-3 block">
                <Button variant="ghost" size="sm" className="w-full">
                  <Building2 className="mr-1 h-4 w-4" /> Ver perfil da empresa
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Other products from seller */}
      {otherProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-extrabold text-foreground">
            <ShoppingBag className="mr-2 inline h-5 w-5" />
            Outros produtos {seller ? `de ${seller.company_name}` : "do vendedor"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {otherProducts.map((p) => {
              const imgs = (p.images && p.images.length > 0) ? p.images : p.image_url ? [p.image_url] : [];
              return (
                <Link key={p.id} to={`/produto/${p.id}`} className="group rounded-2xl border border-border bg-card overflow-hidden card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1">
                  <div className="aspect-video bg-muted overflow-hidden">
                    {imgs.length > 0 ? (
                      <img src={imgs[0]} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Package className="h-10 w-10 text-muted-foreground/40" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 text-sm font-bold text-card-foreground truncate">{p.title}</h3>
                    <span className="text-base font-extrabold text-primary">
                      {p.price > 0 ? `R$ ${p.price.toFixed(2).replace(".", ",")}` : "Consulte condições"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {ConfirmDialog}
    </div>
  );
}
