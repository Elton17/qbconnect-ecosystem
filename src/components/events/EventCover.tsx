import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EventCoverProps {
  title: string;
  startDate: string;
  category?: string | null;
  eventType?: string | null;
  isFree?: boolean;
  price?: number | null;
  featured?: boolean;
  className?: string;
  size?: "card" | "wide";
}

function titleSize(title: string, size: "card" | "wide") {
  if (size === "wide") {
    if (title.length > 62) return "text-xl sm:text-3xl lg:text-4xl";
    if (title.length > 36) return "text-2xl sm:text-4xl lg:text-5xl";
    return "text-3xl sm:text-5xl lg:text-6xl";
  }
  if (title.length > 62) return "text-base sm:text-lg";
  if (title.length > 36) return "text-lg sm:text-xl";
  return "text-xl sm:text-2xl";
}

export default function EventCover({
  title,
  startDate,
  category,
  eventType,
  isFree = false,
  price = 0,
  featured = false,
  className,
  size = "card",
}: EventCoverProps) {
  const date = new Date(startDate);
  const day = format(date, "dd");
  const month = format(date, "MMM", { locale: ptBR }).replace(".", "").toUpperCase();
  const typeLabel = eventType === "online" ? "Online" : eventType === "hibrido" ? "Híbrido" : "Presencial";

  return (
    <div className={cn("event-cover relative flex aspect-video w-full overflow-hidden bg-secondary", className)}>
      <div className="relative z-10 flex w-[29%] shrink-0 flex-col items-center justify-center border-r-[5px] border-secondary bg-primary px-2 text-primary-foreground sm:px-4">
        <span className={cn("font-event-display leading-none", size === "wide" ? "text-5xl sm:text-7xl lg:text-8xl" : "text-4xl sm:text-5xl")}>{day}</span>
        <span className={cn("font-event-body font-bold uppercase", size === "wide" ? "text-lg sm:text-2xl" : "text-sm sm:text-base")}>{month}</span>
        <span className="mt-2 hidden border-t border-primary-foreground/40 pt-2 font-event-body text-[10px] font-semibold uppercase sm:block">{typeLabel}</span>
      </div>

      <div className={cn("relative flex min-w-0 flex-1 flex-col justify-end", size === "wide" ? "p-5 sm:p-8 lg:p-10" : "p-3 sm:p-4")}>
        <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-5 select-none font-event-display text-[7rem] leading-none text-secondary-foreground/5 sm:text-[10rem]">EVT</span>
        <div className={cn("absolute left-3 top-3 flex max-w-[65%] items-center gap-1.5 sm:left-4 sm:top-4", size === "wide" && "sm:left-8 sm:top-8")}>
          {category && <span className="truncate border border-secondary bg-card px-2 py-0.5 font-event-body text-[9px] font-bold uppercase text-card-foreground sm:text-[10px]">{category}</span>}
          {featured && <span className="hidden bg-primary px-2 py-0.5 font-event-body text-[9px] font-bold uppercase text-primary-foreground sm:inline">Destaque</span>}
        </div>
        <div className="absolute right-0 top-0 bg-primary px-2 py-1 sm:px-3">
          <span className="font-event-body text-[10px] font-bold uppercase text-primary-foreground sm:text-xs">
            {isFree ? "Gratuito" : `R$ ${(price || 0).toFixed(2).replace(".", ",")}`}
          </span>
        </div>
        <h2 className={cn("relative z-10 line-clamp-3 break-words font-event-display uppercase leading-[0.96] text-secondary-foreground", titleSize(title, size))}>
          {title}
        </h2>
        <span className="relative z-10 mt-2 font-event-body text-[9px] font-semibold uppercase text-secondary-foreground/55 sm:text-[10px]">QBCAMP Conecta Mais</span>
      </div>
    </div>
  );
}