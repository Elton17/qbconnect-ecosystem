import { BriefcaseBusiness, MapPin, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductFallbackCoverProps {
  id: string;
  title: string;
  productType: string;
  category?: string | null;
  className?: string;
}

const patterns = [
  "from-primary via-primary-dark to-secondary",
  "from-secondary via-secondary to-primary-dark",
  "from-primary-dark via-secondary to-primary",
];

export default function ProductFallbackCover({ id, title, productType, category, className }: ProductFallbackCoverProps) {
  const patternIndex = Array.from(id).reduce((total, character) => total + character.charCodeAt(0), 0) % patterns.length;
  const Icon = productType === "service" ? BriefcaseBusiness : Package;
  const typeLabel = productType === "service" ? "Serviço local" : "Produto local";
  const titleSize = title.length > 42 ? "text-base sm:text-xl" : title.length > 24 ? "text-lg sm:text-2xl" : "text-xl sm:text-3xl";

  return (
    <div
      role="img"
      aria-label={`Capa automática de ${typeLabel.toLowerCase()}: ${title}`}
      className={cn("relative flex h-full w-full overflow-hidden bg-gradient-to-br text-primary-foreground", patterns[patternIndex], className)}
    >
      <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_2px_2px,currentColor_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-[18px] border-primary-foreground/10" />
      <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/25 bg-secondary/35 px-2 py-1 text-[10px] font-bold uppercase">
            <Icon className="h-3 w-3" /> {typeLabel}
          </span>
          <span className="text-[10px] font-extrabold uppercase text-primary-foreground/75">QBCAMP Conecta+</span>
        </div>
        <div>
          {category && <span className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase text-primary-foreground/70"><MapPin className="h-3 w-3" />{category}</span>}
          <h3 className={cn("line-clamp-3 max-w-[92%] font-heading font-extrabold leading-tight", titleSize)}>{title}</h3>
          <div className="mt-3 h-1 w-12 rounded-full bg-primary-foreground/70" />
        </div>
      </div>
    </div>
  );
}