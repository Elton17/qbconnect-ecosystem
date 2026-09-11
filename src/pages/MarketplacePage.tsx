import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Company {
  id: string;
  company_name: string;
  segment: string;
  city: string;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  contact_phone: string | null;
}

function getWhatsAppUrl(company: Company) {
  const digits = (company.contact_phone || company.phone).replace(/\D/g, "");
  const phone = digits.startsWith("55") ? digits : `55${digits}`;
  const message = `Olá! Encontrei a ${company.company_name} no Guia de Empresas da QBCAMP Conecta+ e gostaria de conversar.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function MarketplacePage() {
  usePageTitle("Guia de Empresas");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("all");
  const [city, setCity] = useState("all");

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, company_name, segment, city, description, logo_url, phone, contact_phone")
        .eq("approved", true)
        .order("company_name");

      setCompanies((data || []) as Company[]);
      setLoading(false);
    }

    loadCompanies();
  }, []);

  const segments = useMemo(
    () => [...new Set(companies.map((company) => company.segment).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [companies],
  );
  const cities = useMemo(
    () => [...new Set(companies.map((company) => company.city).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [companies],
  );

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return companies.filter((company) => {
      const matchesSearch = !term || [company.company_name, company.segment, company.description || "", company.city]
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(term));
      const matchesSegment = segment === "all" || company.segment === segment;
      const matchesCity = city === "all" || company.city === city;
      return matchesSearch && matchesSegment && matchesCity;
    });
  }, [companies, search, segment, city]);

  const hasFilters = Boolean(search || segment !== "all" || city !== "all");

  function clearFilters() {
    setSearch("");
    setSegment("all");
    setCity("all");
  }

  return (
    <div>
      <section className="border-b border-border bg-secondary py-12 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <Building2 className="h-4 w-4" /> Rede empresarial regional
            </div>
            <h1 className="mb-4 text-3xl font-extrabold text-secondary-foreground md:text-5xl">
              Guia de Empresas <span className="text-gradient">Associadas</span>
            </h1>
            <p className="mx-auto max-w-2xl text-secondary-foreground/70 md:text-lg">
              Encontre empresas confiáveis da região por atividade ou cidade e fale diretamente com quem pode ajudar.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="flex min-w-[150px] items-center gap-3 rounded-lg border border-secondary-foreground/10 bg-secondary-foreground/5 px-5 py-3 text-left">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-lg font-bold text-secondary-foreground">{companies.length}</div>
                  <div className="text-xs text-secondary-foreground/60">Empresas</div>
                </div>
              </div>
              <div className="flex min-w-[150px] items-center gap-3 rounded-lg border border-secondary-foreground/10 bg-secondary-foreground/5 px-5 py-3 text-left">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-lg font-bold text-secondary-foreground">{segments.length}</div>
                  <div className="text-xs text-secondary-foreground/60">Segmentos</div>
                </div>
              </div>
              <div className="flex min-w-[150px] items-center gap-3 rounded-lg border border-secondary-foreground/10 bg-secondary-foreground/5 px-5 py-3 text-left">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-lg font-bold text-secondary-foreground">{cities.length}</div>
                  <div className="text-xs text-secondary-foreground/60">Cidades</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-border bg-card py-6">
        <div className="container">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <label className="relative block">
              <span className="sr-only">Buscar empresas</span>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por empresa, atividade ou palavra-chave..."
                className="h-11 w-full rounded-md border border-input bg-background pl-12 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </label>

            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Todos os segmentos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os segmentos</SelectItem>
                {segments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Todas as cidades" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" className="h-11" onClick={clearFilters}>
                <X className="h-4 w-4" /> Limpar
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">Empresas associadas</h2>
          {!loading && <p className="text-sm text-muted-foreground">{filteredCompanies.length} resultado{filteredCompanies.length !== 1 ? "s" : ""}</p>}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Carregando empresas">
            {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-60 animate-pulse rounded-lg border border-border bg-muted" />)}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">Nenhuma empresa encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">Tente outro nome, segmento ou cidade.</p>
            {hasFilters && <Button variant="outline" className="mt-5" onClick={clearFilters}>Limpar filtros</Button>}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCompanies.map((company, index) => (
              <motion.article
                key={company.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.24) }}
                className="flex min-h-[250px] flex-col rounded-lg border border-border bg-card p-5 card-shadow transition-shadow hover:card-shadow-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-xl font-extrabold text-primary">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={`Logo da ${company.company_name}`} className="h-full w-full object-contain p-1" loading="lazy" />
                    ) : company.company_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-semibold uppercase text-primary">{company.segment}</p>
                    <h3 className="text-lg font-bold leading-snug text-card-foreground">{company.company_name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {company.city}
                    </p>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {company.description || "Conheça esta empresa associada e entre em contato para saber mais sobre suas soluções."}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/empresa/${company.id}`}>Ver perfil</Link>
                  </Button>
                  {(company.contact_phone || company.phone) ? (
                    <Button asChild>
                      <a href={getWhatsAppUrl(company)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                    </Button>
                  ) : (
                    <Button disabled><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}