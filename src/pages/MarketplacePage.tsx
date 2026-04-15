import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useToast } from "@/hooks/use-toast";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { Loader2, Package, Plus, SlidersHorizontal, ShoppingBag, Building2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MarketplaceSearchBar from "@/components/marketplace/MarketplaceSearchBar";
import MarketplaceFilters, { FilterState, defaultFilters } from "@/components/marketplace/MarketplaceFilters";
import ProductCard, { type ProductWithSeller } from "@/components/marketplace/ProductCard";
import ProductFormDialog from "@/components/marketplace/ProductFormDialog";
import PromotionsSection from "@/components/marketplace/PromotionsSection";
import PlanUpgradeModal from "@/components/PlanUpgradeModal";

export default function MarketplacePage() {
  usePageTitle("Marketplace");
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const { confirmDelete, ConfirmDialog } = useConfirmDelete();
  const planLimits = usePlanLimits();

  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("relevant");
  const [isAssociate, setIsAssociate] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Check associate
  useEffect(() => {
    if (!user) { setIsAssociate(false); return; }
    supabase.from("profiles").select("id").eq("user_id", user.id).eq("approved", true).maybeSingle().then(({ data }) => setIsAssociate(!!data));
  }, [user]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [productsRes, profilesRes] = await Promise.all([
      supabase.from("products").select("*").eq("active", true),
      supabase.from("profiles").select("user_id, company_name, city, plan, logo_url, segment, contact_phone").eq("approved", true),
    ]);

    const profileMap = new Map<string, any>();
    (profilesRes.data || []).forEach((p: any) => profileMap.set(p.user_id, p));

    const enriched: ProductWithSeller[] = ((productsRes.data || []) as any[]).map((p) => {
      const seller = profileMap.get(p.user_id);
      return {
        ...p,
        view_count: p.view_count || 0,
        contact_count: p.contact_count || 0,
        price_type: p.price_type || "fixed",
        product_type: p.product_type || "product",
        city: p.city || seller?.city || "",
        contact_phone: p.contact_phone || seller?.contact_phone || "",
        seller_name: seller?.company_name || "",
        seller_city: seller?.city || "",
        seller_plan: seller?.plan || "basic",
        seller_logo: seller?.logo_url || null,
        seller_segment: seller?.segment || "",
      };
    });

    setProducts(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Handle edit from detail page
  useEffect(() => {
    const state = location.state as { editProductId?: string } | null;
    if (state?.editProductId && products.length > 0) {
      const p = products.find(x => x.id === state.editProductId);
      if (p && user && user.id === p.user_id) {
        setEditingProduct(p);
        setDialogOpen(true);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, products, user]);

  const filtered = useMemo(() => {
    let result = products;

    // Search
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s) ||
        (p.seller_name || "").toLowerCase().includes(s)
      );
    }

    // Quick category
    if (activeCategory !== "Todos") {
      result = result.filter(p =>
        (p.category || "").toLowerCase().includes(activeCategory.toLowerCase()) ||
        (p.seller_segment || "").toLowerCase().includes(activeCategory.toLowerCase())
      );
    }

    // Sidebar filters
    if (filters.productType !== "all") {
      result = result.filter(p => p.product_type === filters.productType);
    }
    if (filters.segments.length > 0) {
      result = result.filter(p => filters.segments.some(s => (p.seller_segment || "").toLowerCase().includes(s.toLowerCase())));
    }
    if (filters.priceMin) {
      result = result.filter(p => p.price >= parseFloat(filters.priceMin));
    }
    if (filters.priceMax) {
      result = result.filter(p => p.price <= parseFloat(filters.priceMax));
    }
    if (filters.cities.length > 0) {
      result = result.filter(p => filters.cities.some(c => (p.city || p.seller_city || "").toLowerCase().includes(c.toLowerCase())));
    }
    if (filters.premiumOnly) {
      result = result.filter(p => p.seller_plan === "premium");
    }

    // Sort
    switch (sortBy) {
      case "recent":
        result = [...result].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case "price_asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "views":
        result = [...result].sort((a, b) => b.view_count - a.view_count);
        break;
      default: // relevant: premium first, then recent
        result = [...result].sort((a, b) => {
          const ap = a.seller_plan === "premium" ? 0 : 1;
          const bp = b.seller_plan === "premium" ? 0 : 1;
          if (ap !== bp) return ap - bp;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    }

    return result;
  }, [products, debouncedSearch, activeCategory, filters, sortBy]);

  function openNewProduct() {
    if (!planLimits.canAddProduct) { setUpgradeOpen(true); return; }
    setEditingProduct(null);
    setDialogOpen(true);
  }

  const filtersComponent = (
    <MarketplaceFilters filters={filters} onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <ShoppingBag className="h-4 w-4" /> Marketplace B2B Regional
            </div>
            <h1 className="mb-4 text-3xl font-extrabold text-secondary-foreground md:text-5xl">
              Produtos & Serviços dos <span className="text-gradient">Associados</span>
            </h1>
            <p className="mb-6 text-secondary-foreground/70 md:text-lg">
              Descubra ofertas exclusivas e negocie direto com empresas da região.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {isAssociate && (
                <Button variant="hero" size="lg" onClick={openNewProduct}>
                  <Plus className="mr-1 h-5 w-5" /> Anunciar Produto
                </Button>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: "Produtos", value: products.length, icon: Package },
              { label: "Empresas", value: new Set(products.map(p => p.user_id)).size, icon: Building2 },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-secondary-foreground/10 bg-secondary-foreground/5 px-5 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold text-secondary-foreground">{s.value}</div>
                  <div className="text-xs text-secondary-foreground/60">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PromotionsSection />

      {/* Search bar */}
      <div className="container py-6">
        <MarketplaceSearchBar
          search={search}
          onSearchChange={setSearch}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Main content: sidebar + grid */}
      <div className="container pb-12">
        <div className="flex gap-6">
          {/* Sidebar — desktop only */}
          <aside className="hidden w-[260px] shrink-0 lg:block">
            {filtersComponent}
          </aside>

          {/* Grid area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Exibindo <strong>{filtered.length}</strong> produto{filtered.length !== 1 ? "s" : ""}
              </span>

              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="mr-1 h-4 w-4" /> Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">{filtersComponent}</div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevant">Mais relevantes</SelectItem>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="price_asc">Menor preço</SelectItem>
                    <SelectItem value="price_desc">Maior preço</SelectItem>
                    <SelectItem value="views">Mais visualizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="text-muted-foreground">Nenhum produto encontrado.</p>
                {isAssociate && <Button className="mt-4" onClick={openNewProduct}><Plus className="mr-1 h-4 w-4" /> Anunciar produto</Button>}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSaved={fetchData}
      />

      {ConfirmDialog}
      <PlanUpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} resourceType="produtos" currentLimit={planLimits.limits.products} />
    </div>
  );
}
