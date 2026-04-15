import { useRef } from "react";
import { Link } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductWithSeller } from "./ProductCard";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface Props {
  products: ProductWithSeller[];
}

export default function PremiumHighlights({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const premiumProducts = products.filter(p => p.seller_plan === "premium");

  if (premiumProducts.length === 0) return null;

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="border-b border-border py-6 sm:py-8">
      <div className="container">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Destaques Premium</h2>
          </div>
          <div className="hidden sm:flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scroll(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scroll(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {premiumProducts.map(p => {
            const img = (p.images && p.images.length > 0) ? p.images[0] : p.image_url;
            return (
              <Link
                key={p.id}
                to={`/produto/${p.id}`}
                className="group relative flex-shrink-0 w-[200px] sm:w-[260px] snap-start overflow-hidden rounded-xl border border-amber-300/40 bg-card shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <div className="relative h-[130px] sm:h-[160px] overflow-hidden">
                  {img ? (
                    <img src={img} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                      <Star className="h-8 w-8 text-amber-300/30" />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 shadow">
                    <Star className="h-2.5 w-2.5 fill-amber-900" /> Premium
                  </span>
                </div>
                <div className="p-2.5 sm:p-3">
                  <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 leading-tight mb-1">{p.title}</h3>
                  <span className="text-sm sm:text-base font-extrabold text-primary">
                    {p.price > 0 ? `R$ ${p.price.toFixed(2).replace(".", ",")}` : "Consultar"}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" />
                    <span className="truncate">{p.city || p.seller_city || p.seller_name}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
