import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2, MapPin, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Company {
  id: string;
  company_name: string;
  description: string | null;
  segment: string;
  city: string;
  logo_url: string | null;
}

export default function CompaniesPage() {
  usePageTitle("Guia de Empresas");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("all");
  const [city, setCity] = useState("all");

  useEffect(() => {
    async function loadCompanies() {
      const { data } = await supabase
        .from("profiles")
        .select("id, company_name, description, segment, city, logo_url")
        .eq("approved", true)
        .order("company_name");

      setCompanies((data || []) as Company[]);
      setLoading(false);
    }

    loadCompanies();
  }, []);

  const segments = useMemo(
    () => [...new Set(companies.map((company) => company.segment).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [companies],
  );

  const cities = useMemo(
    () => [...new Set(companies.map((company) => company.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [companies],
  );

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return companies.filter((company) => {
      const matchesSearch = !term || [company.company_name, company.description || "", company.segment, company.city]
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(term));
      return matchesSearch && (segment === "all" || company.segment === segment) && (city === "all" || company.city === city);
    });
  }, [companies, search, segment, city]);

  const hasFilters = Boolean(search || segment !== "all" || city !== "all");

  function clearFilters() {
    setSearch("");
    setSegment("all");
    setCity("all");
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card py-8 md:py-12">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <Building2 className="h-4 w-4" /> Rede empresarial regional
            </div>
            <h1 className="text-3xl font-extrabold text-foreground md:text-4xl">Guia de Empresas</h1>
            <p className="mt-2 text-muted-foreground">Encontre empresas associadas, parceiros e fornecedores da região.</p>

            <label className="relative mt-6 block max-w-3xl">
              <span className="sr-only">Buscar empresas</span>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por empresa, segmento ou cidade..."
                className="h-12 w-full rounded-lg border border-border bg-background pl-12 pr-4 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
              />
            </label>
          </motion.div>
        </div>
      </section>

      <section className="container py-8 md:py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Empresas associadas</h2>
            {!loading && <p className="mt-1 text-sm text-muted-foreground">{filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? "s" : ""} encontrada{filteredCompanies.length !== 1 ? "s" : ""}</p>}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Segmento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os segmentos</SelectItem>
                {segments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-full sm:w-[190px]"><SelectValue placeholder="Cidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar filtros" aria-label="Limpar filtros">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Carregando empresas">
            {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-64 animate-pulse rounded-lg border border-border bg-muted" />)}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">Nenhuma empresa encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">Tente outro nome, segmento ou cidade.</p>
            {hasFilters && <Button variant="outline" className="mt-5" onClick={clearFilters}>Limpar filtros</Button>}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCompanies.map((company, index) => (
              <motion.article
                key={company.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.035, 0.2) }}
                className="flex min-h-64 flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 font-heading text-xl font-bold text-primary">
                    {company.logo_url ? <img src={company.logo_url} alt={`Logo da ${company.company_name}`} className="h-full w-full object-contain" loading="lazy" /> : company.company_name.charAt(0)}
                  </div>
                  {company.segment && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{company.segment}</span>}
                </div>
                <h3 className="text-lg font-bold text-foreground">{company.company_name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{company.description || "Conheça esta empresa associada à QBCAMP."}</p>
                {company.city && <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {company.city}</p>}
                <Button variant="outline" className="mt-auto w-full" asChild>
                  <Link to={`/empresa/${company.id}`}>Ver perfil <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}