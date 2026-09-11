import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Package, Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard, { type ProductWithSeller } from "@/components/marketplace/ProductCard";
import PremiumHighlights from "@/components/marketplace/PremiumHighlights";

type ProductTypeFilter = "all" | "product" | "service" | "plan";

const productTypes: { value: ProductTypeFilter; label: string }[] = [
  { value: "all", label: "Todos os anúncios" },
  { value: "product", label: "Produtos" },
  { value: "service", label: "Serviços" },
  { value: "plan", label: "Planos corporativos" },
];

export default function MarketplacePage() {
  usePageTitle("Marketplace");
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [productType, setProductType] = useState<ProductTypeFilter>("all");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data: productRows } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (!productRows?.length) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(productRows.map((product) => product.user_id))];
      const { data: sellers } = await supabase
        .from("profiles")
        .select("user_id, company_name, city, plan, logo_url, segment")
        .in("user_id", userIds)
        .eq("approved", true);

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

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter((item): item is string => Boolean(item)))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return products.filter((product) => {
      const matchesSearch = !term || [
        product.title,
        product.description || "",
        product.category || "",
        product.seller_name || "",
        product.city || product.seller_city || "",
      ].some((value) => value.toLocaleLowerCase("pt-BR").includes(term));
      const matchesCategory = category === "all" || product.category === category;
      const matchesType = productType === "all" || product.product_type === productType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [products, search, category, productType]);

  const hasFilters = Boolean(search || category !== "all" || productType !== "all");

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setProductType("all");
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card py-6 md:py-9">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid items-center gap-6 lg:grid-cols-[340px_minmax(0,1fr)]"
          >
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
                <ShoppingBag className="h-4 w-4" /> Comércio regional conectado
              </div>
              <h1 className="text-3xl font-extrabold text-foreground md:text-4xl">Marketplace QBCAMP</h1>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">Encontre produtos, serviços e soluções para sua empresa na região.</p>
            </div>

            <label className="relative block">
              <span className="sr-only">Buscar no Marketplace</span>
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar produtos, serviços, empresas ou cidades..."
                className="h-14 w-full rounded-lg border-2 border-primary bg-background pl-14 pr-5 text-base text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </label>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/50 py-4">
        <div className="container">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Categorias</p>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Categorias do Marketplace">
            <Button
              size="sm"
              variant={category === "all" ? "default" : "outline"}
              className="shrink-0"
              onClick={() => setCategory("all")}
            >
              Tudo
            </Button>
            {categories.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={category === item ? "default" : "outline"}
                className="shrink-0"
                onClick={() => setCategory(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {!loading && !hasFilters && <PremiumHighlights products={products} />}

      <section className="container py-8 md:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Vitrine comercial</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Todos os anúncios</h2>
            {!loading && (
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredProducts.length} anúncio{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="hidden h-4 w-4 text-muted-foreground sm:block" />
            <Select value={productType} onValueChange={(value) => setProductType(value as ProductTypeFilter)}>
              <SelectTrigger className="w-full sm:w-[210px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {productTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
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
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-label="Carregando anúncios">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => <div key={item} className="h-[350px] animate-pulse rounded-lg border border-border bg-muted" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">Nenhum anúncio encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">Tente outro termo, tipo ou categoria.</p>
            {hasFilters && <Button variant="outline" className="mt-5" onClick={clearFilters}>Limpar filtros</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.035, 0.2) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}