import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PublicPageBannerProps {
  image: string;
  imageAlt: string;
  locationLabel?: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
  align?: "left" | "center";
}

export default function PublicPageBanner({
  image,
  imageAlt,
  locationLabel,
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  align = "left",
}: PublicPageBannerProps) {
  const centered = align === "center";

  return (
    <section className="relative isolate min-h-[360px] overflow-hidden bg-secondary py-14 text-secondary-foreground md:min-h-[420px] md:py-20">
      <img
        src={image}
        alt={imageAlt}
        width={1600}
        height={600}
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-secondary/95 via-secondary/75 to-secondary/35" />
      <div className="container flex min-h-[250px] items-center md:min-h-[260px]">
        <div className={centered ? "mx-auto max-w-4xl text-center" : "max-w-3xl"}>
          <div className={`mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-primary ${centered ? "justify-center" : ""}`}>
            <Icon className="h-4 w-4" /> {eyebrow}
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-secondary-foreground md:text-5xl lg:text-6xl">{title}</h1>
          <p className={`mt-5 max-w-2xl text-base text-secondary-foreground/80 md:text-lg ${centered ? "mx-auto" : ""}`}>{description}</p>
          {children && <div className={`mt-7 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}>{children}</div>}
        </div>
      </div>
      {locationLabel && (
        <div className="absolute bottom-4 right-5 z-10 border-l-2 border-primary pl-3 text-right md:bottom-6 md:right-8">
          <span className="block text-[10px] font-semibold uppercase text-secondary-foreground/65">Nossa região</span>
          <span className="text-sm font-bold text-secondary-foreground">{locationLabel}</span>
        </div>
      )}
    </section>
  );
}