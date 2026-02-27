import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

interface Company {
  id: string;
  company_name: string;
  logo_url: string | null;
}

export default function CompanyLogosCarousel() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, company_name, logo_url")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data && data.length > 0) setCompanies(data);
      });
  }, []);

  if (companies.length === 0) return null;

  // Duplicate for infinite scroll effect
  const items = [...companies, ...companies];

  return (
    <section className="border-y border-border bg-muted/30 py-12 overflow-hidden">
      <div className="container mb-8 text-center">
        <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
          Empresas associadas
        </span>
        <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">
          Quem já faz parte do ecossistema
        </h2>
      </div>

      <div className="relative" ref={containerRef}>
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-muted/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-muted/80 to-transparent" />

        <motion.div
          className="flex items-center gap-10"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: { repeat: Infinity, repeatType: "loop", duration: companies.length * 3, ease: "linear" },
          }}
        >
          {items.map((c, i) => (
            <div
              key={`${c.id}-${i}`}
              className="flex h-20 w-40 shrink-0 items-center justify-center rounded-xl border border-border bg-card px-4 transition-shadow hover:shadow-md"
              title={c.company_name}
            >
              {c.logo_url ? (
                <img
                  src={c.logo_url}
                  alt={c.company_name}
                  className="max-h-14 max-w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Building2 className="h-6 w-6" />
                  <span className="max-w-[120px] truncate text-xs font-medium">{c.company_name}</span>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
