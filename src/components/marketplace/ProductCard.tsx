import { Link } from "react-router-dom";
import { Package, MapPin, Eye, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export interface ProductWithSeller {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  images: string[] | null;
  contact_phone: string | null;
  view_count: number;
  contact_count: number;
  price_type: string;
  product_type: string;
  city: string | null;
  created_at: string | null;
  // joined seller info
  seller_name?: string;
  seller_city?: string;
  seller_plan?: string;
  seller_logo?: string | null;
  seller_segment?: string;
}

function getWhatsAppUrl(phone: string, title: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(`Olá! Vi seu produto *${title}* no QBCAMP Conecta+ e tenho interesse. Podemos conversar?`)}`;
}

function isNew(createdAt: string | null) {
  if (!createdAt) return false;
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

async function incrementContact(productId: string) {
  try {
    await supabase.rpc("increment_product_contact", { p_id: productId });
  } catch {}
}

export default function ProductCard({ product }: { product: ProductWithSeller }) {
  const imgs = (product.images && product.images.length > 0) ? product.images : product.image_url ? [product.image_url] : [];
  const isPremium = product.seller_plan === "premium";

  return (
    <div className={`group flex flex-col overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${isPremium ? "border-l-[3px] border-l-primary border border-border" : "border border-border"}`}>
      {/* Image */}
      <Link to={`/produto/${product.id}`} className="relative block overflow-hidden" style={{ height: 220 }}>
        {imgs.length > 0 ? (
          <img
            src={imgs[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {isPremium && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-900 shadow">
            <Star className="h-3 w-3 fill-amber-900" /> Premium
          </span>
        )}

        {isNew(product.created_at) && (
          <span className="absolute right-2 top-2 animate-pulse rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow">
            NOVO
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        {(product.category || product.seller_segment) && (
          <span className="mb-1 text-xs font-medium uppercase text-muted-foreground tracking-wide">
            {[product.category, product.seller_segment].filter(Boolean).join(" · ")}
          </span>
        )}

        {/* Title */}
        <Link to={`/produto/${product.id}`}>
          <h3 className="mb-1 text-base font-semibold text-card-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <span className="mb-2 text-xl font-extrabold text-primary">
          {product.price > 0 ? `R$ ${product.price.toFixed(2).replace(".", ",")}` : "Consultar preço"}
        </span>

        {/* Seller info */}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground overflow-hidden">
            {product.seller_logo ? (
              <img src={product.seller_logo} alt="" className="h-full w-full object-cover" />
            ) : (
              (product.seller_name || "?").charAt(0)
            )}
          </div>
          <span className="text-sm text-muted-foreground truncate">{product.seller_name || "Vendedor"}</span>
          {(product.city || product.seller_city) && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {product.city || product.seller_city}
            </span>
          )}
        </div>

        {/* Engagement */}
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{product.view_count || 0}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{product.contact_count || 0}</span>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-auto">
          {product.contact_phone ? (
            <a
              href={getWhatsAppUrl(product.contact_phone, product.title)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                incrementContact(product.id);
              }}
            >
              <Button size="sm" variant="whatsapp" className="w-full">
                <WhatsAppIcon className="mr-1.5 h-4 w-4" /> Falar com vendedor
              </Button>
            </a>
          ) : (
            <Link to={`/produto/${product.id}`}>
              <Button size="sm" variant="outline" className="w-full">Ver detalhes</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
