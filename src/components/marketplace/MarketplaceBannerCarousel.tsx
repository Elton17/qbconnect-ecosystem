import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Network, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import quatroBarrasAsset from "@/assets/regions/quatro-barras-entrada.webp.asset.json";
import campinaAsset from "@/assets/regions/campina-centro.webp.asset.json";
import reservaAsset from "@/assets/regions/campina-reserva.webp.asset.json";

const banners = [
  {
    image: quatroBarrasAsset.url,
    imageAlt: "Vista urbana de Quatro Barras, Paraná",
    eyebrow: "Quatro Barras · Comércio local",
    title: "Produtos que movimentam nossa cidade",
    description: "Encontre produtos de empresas locais e movimente a economia regional.",
    action: "Ver produtos",
    type: "product" as const,
    icon: MapPin,
  },
  {
    image: campinaAsset.url,
    imageAlt: "Paisagem de Campina Grande do Sul, Paraná",
    eyebrow: "Campina Grande do Sul · Serviços",
    title: "Especialistas perto da sua empresa",
    description: "Conecte-se a fornecedores preparados para apoiar o crescimento do seu negócio.",
    action: "Encontrar serviços",
    type: "service" as const,
    icon: Wrench,
  },
  {
    image: reservaAsset.url,
    imageAlt: "Paisagem natural de Campina Grande do Sul, Paraná",
    eyebrow: "Quatro Barras + Campina Grande do Sul",
    title: "Uma região conectada para crescer",
    description: "Uma rede regional feita para aproximar empresas, oportunidades e novos mercados.",
    action: "Explorar a região",
    type: "all" as const,
    icon: Network,
  },
];

export default function MarketplaceBannerCarousel({ onTypeSelect }: { onTypeSelect: (type: "all" | "product" | "service") => void }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % banners.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  const current = banners[active];
  const goTo = (index: number) => setActive((index + banners.length) % banners.length);

  return (
    <section className="relative min-h-[330px] overflow-hidden rounded-lg bg-secondary shadow-lg md:min-h-[390px]" aria-roledescription="carrossel" aria-label="Destaques do Marketplace">
      {banners.map((banner, index) => (
        <img
          key={banner.title}
          src={banner.image}
          alt={banner.imageAlt}
          width={1600}
          height={600}
          aria-hidden={index !== active}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />
      <div className="relative z-10 flex min-h-[330px] max-w-2xl flex-col justify-center px-6 py-12 text-secondary-foreground md:min-h-[390px] md:px-12">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase text-primary-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary"><current.icon className="h-4 w-4" /></span>
          {current.eyebrow}
        </div>
        <h2 className="max-w-xl text-3xl font-extrabold leading-tight md:text-5xl">{current.title}</h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-secondary-foreground/80 md:text-base">{current.description}</p>
        <Button className="mt-7 w-fit" size="lg" onClick={() => onTypeSelect(current.type)}>{current.action}</Button>
      </div>

      <div className="absolute bottom-5 left-6 z-20 flex items-center gap-2 md:left-12">
        {banners.map((banner, index) => (
          <Button
            key={banner.title}
            variant="ghost"
            size="icon"
            aria-label={`Mostrar banner ${index + 1}: ${banner.title}`}
            onClick={() => goTo(index)}
            className={`h-3 rounded-full p-0 transition-all hover:bg-primary ${index === active ? "w-9 bg-primary" : "w-3 bg-secondary-foreground/40"}`}
          />
        ))}
      </div>
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full border border-secondary-foreground/20 bg-secondary/70" onClick={() => goTo(active - 1)} aria-label="Banner anterior"><ChevronLeft /></Button>
        <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full border border-secondary-foreground/20 bg-secondary/70" onClick={() => goTo(active + 1)} aria-label="Próximo banner"><ChevronRight /></Button>
      </div>
    </section>
  );
}