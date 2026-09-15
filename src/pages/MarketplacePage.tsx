import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Filter, MapPinned, Package, Search, ShoppingBag, Store, Wrench, X } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ProductCard, { type ProductWithSeller } from "@/components/marketplace/ProductCard";
import MarketplaceBannerCarousel from "@/components/marketplace/MarketplaceBannerCarousel";
import MarketplaceFilters, { defaultFilters, MARKETPLACE_REGIONS, type FilterState } from "@/components/marketplace/MarketplaceFilters";

type SortOrder = "recent" | "price-low" | "price-high" | "popular";

const shortcuts = [
  { label: "Produtos", description: "Itens para sua empresa", icon: ShoppingBag, type: "product" as const },
  { label: "Serviços", description: "Profissionais da região", icon: Wrench, type: "service" as const },
  { label: "Por cidade", description: "Compre mais perto", icon: MapPinned, type: "all" as const },
  { label: "Todos os anúncios", description: "Explore a vitrine", icon: Store, type: "all" as const },
];

export default function MarketplacePage() {
  usePageTitle("Marketplace");
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data: productRows } = await supabase.from("products").select("*").eq("active", true).eq("moderation_status", "approved").order("created_at", { ascending: false });
      if (!productRows?.length) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const userIds = [...new Set(productRows.map((product) => product.user_id))];
      const { data: sellers } = await supabase.from("profiles").select("user_id, company_name, city, plan, logo_url, segment").in("user_id", userIds).eq("approved", true);
      const sellerMap = new Map((sellers || []).map((seller) => [seller.user_id, seller]));
      setProducts(productRows.map((product) => {
        const seller = sellerMap.get(product.user_id);
        return {
          ...product,
          view_count: product.view_count || 0,
          contact_count: product.contact_count || 0,
          price_type: product.price_type || "fixed",
          product_type: product.product_type || "product",
          seller_name: seller?.company_name,
          seller_city: seller?.city,
          seller_plan: seller?.plan,
          seller_logo: seller?.logo_url,
          seller_segment: seller?.segment,
        } as ProductWithSeller;
      }));
      setLoading(false);
    }
    loadProducts();
  }, []);

  const categories = useMemo(() => [...new Set(products.map((item) => item.category).filter((item): item is string => Boolean(item)))].sort((a, b) => a.localeCompare(b, "pt-BR")), [products]);
  const cities = useMemo(() => [...new Set(products.map((item) => item.city || item.seller_city).filter((item): item is string => Boolean(item)))].sort((a, b) => a.localeCompare(b, "pt-BR")), [products]);
  const segments = useMemo(() => [...new Set(products.map((item) => item.seller_segment).filter((item): item is string => Boolean(item)))].sort((a, b) => a.localeCompare(b, "pt-BR")), [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    const min = filters.priceMin ? Number(filters.priceMin) : null;
    const max = filters.priceMax ? Number(filters.priceMax) : null;
    const selectedRegionCities = MARKETPLACE_REGIONS.filter((region) => filters.regions.includes(region.name)).flatMap((region) => region.cities);

    return products.filter((product) => {
      const location = product.city || product.seller_city || "";
      const searchable = [product.title, product.description || "", product.category || "", product.seller_name || "", location, product.seller_segment || ""];
      const priceFilterApplies = product.price_type !== "consult" && product.price > 0;
      return (!term || searchable.some((value) => value.toLocaleLowerCase("pt-BR").includes(term)))
        && (filters.productType === "all" || product.product_type === filters.productType)
        && (!filters.categories.length || Boolean(product.category && filters.categories.includes(product.category)))
        && (!filters.segments.length || Boolean(product.seller_segment && filters.segments.includes(product.seller_segment)))
        && (!filters.cities.length || filters.cities.includes(location))
        && (!filters.regions.length || selectedRegionCities.includes(location))
        && (!priceFilterApplies || min === null || product.price >= min)
        && (!priceFilterApplies || max === null || product.price <= max);
    }).sort((a, b) => {
      if (sortOrder === "price-low") return a.price - b.price;
      if (sortOrder === "price-high") return b.price - a.price;
      if (sortOrder === "popular") return (b.view_count + b.contact_count) - (a.view_count + a.contact_count);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [products, search, filters, sortOrder]);

  const activeFilterCount = filters.categories.length + filters.segments.length + filters.regions.length + filters.cities.length
    + (filters.productType === "all" ? 0 : 1) + (filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0);
  const hasFilters = Boolean(search || activeFilterCount);
  const clearFilters = () => { setSearch(""); setFilters(defaultFilters); };
  const selectType = (type: FilterState["productType"]) => setFilters((current) => ({ ...current, productType: type }));

  const filterPanel = <MarketplaceFilters filters={filters} categories={categories} cities={cities} segments={segments} onChange={setFilters} onClear={clearFilters} />;

  return (
    <div className="min-h-screen bg-background pb-16">
      <section className="border-b border-border bg-card py-6 md:py-8">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid items-center gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary"><ShoppingBag className="h-4 w-4" /> Comércio regional conectado</div>
              <h1 className="text-3xl font-extrabold text-foreground md:text-4xl">Marketplace QBCAMP</h1>
              <p className="mt-2 text-sm text-muted-foreground">Produtos e serviços de empresas da nossa região.</p>
            </div>
            <label className="relative block">
              <span className="sr-only">Buscar no Marketplace</span>
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="O que sua empresa precisa?" className="h-14 w-full rounded-lg border-2 border-primary bg-background pl-14 pr-12 text-base text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2" />
              {search && <Button variant="ghost" size="icon" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Limpar busca"><X /></Button>}
            </label>
          </motion.div>
        </div>
      </section>

      <main className="container py-6 md:py-8">
        <MarketplaceBannerCarousel onTypeSelect={selectType} />

        <section className="grid grid-cols-2 gap-3 py-6 md:grid-cols-4" aria-label="Atalhos do Marketplace">
          {shortcuts.map((shortcut) => (
            <Button key={shortcut.label} variant="outline" onClick={() => selectType(shortcut.type)} className="h-auto min-h-24 justify-start whitespace-normal bg-card p-4 text-left shadow-sm hover:border-primary hover:bg-card">
              <span className="mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-primary"><shortcut.icon className="h-5 w-5" /></span>
              <span><strong className="block text-sm text-foreground">{shortcut.label}</strong><small className="mt-1 block font-normal text-muted-foreground">{shortcut.description}</small></span>
            </Button>
          ))}
        </section>

        <div className="grid items-start gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="sticky top-24 hidden lg:block">{filterPanel}</aside>

          <section>
            <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">Vitrine comercial</p>
                <h2 className="mt-1 text-2xl font-bold text-foreground">Anúncios da região</h2>
                {!loading && <p className="mt-1 text-sm text-muted-foreground">{filteredProducts.length} anúncio{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}</p>}
              </div>
              <div className="flex gap-2">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden"><Filter /> Filtros {activeFilterCount > 0 && <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{activeFilterCount}</span>}</Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[90vw] overflow-y-auto p-4 sm:max-w-sm">
                    <SheetHeader className="mb-4 pr-8"><SheetTitle>Filtrar anúncios</SheetTitle><SheetDescription>Escolha localização, tipo, categoria e preço.</SheetDescription></SheetHeader>
                    {filterPanel}
                    <Button className="mt-4 w-full" onClick={() => setMobileFiltersOpen(false)}>Ver {filteredProducts.length} resultados</Button>
                  </SheetContent>
                </Sheet>
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                  <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="popular">Mais procurados</SelectItem>
                    <SelectItem value="price-low">Menor preço</SelectItem>
                    <SelectItem value="price-high">Maior preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3" aria-label="Carregando anúncios">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-[350px] animate-pulse rounded-lg border border-border bg-muted" />)}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card py-16 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-bold text-foreground">Nenhum anúncio encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">Tente ampliar a região ou retirar algum filtro.</p>
                {hasFilters && <Button variant="outline" className="mt-5" onClick={clearFilters}>Limpar filtros</Button>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                {filteredProducts.map((product, index) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.035, 0.2) }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-8 flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              <Building2 className="h-5 w-5 shrink-0 text-primary" /> Os anúncios conectam você diretamente às empresas. A negociação acontece pelo WhatsApp.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}