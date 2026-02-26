import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Filter, Star, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";

const categories = ["Todos", "Tecnologia", "Construção", "Alimentação", "Saúde", "Serviços", "Indústria"];

const mockCompanies = [
  { id: 1, name: "TechSol Sistemas", segment: "Tecnologia", city: "Quatro Barras", rating: 4.8, products: 12, description: "Soluções em software e automação empresarial." },
  { id: 2, name: "ConstroMax", segment: "Construção", city: "Campina Grande do Sul", rating: 4.6, products: 28, description: "Materiais de construção e acabamento." },
  { id: 3, name: "Sabor Regional", segment: "Alimentação", city: "Quatro Barras", rating: 4.9, products: 45, description: "Produtos alimentícios artesanais da região." },
  { id: 4, name: "CliniVida", segment: "Saúde", city: "Campina Grande do Sul", rating: 4.7, products: 8, description: "Clínica de saúde ocupacional e exames." },
  { id: 5, name: "MetalForge", segment: "Indústria", city: "Quatro Barras", rating: 4.5, products: 33, description: "Metalurgia e peças industriais sob medida." },
  { id: 6, name: "ConectaRH", segment: "Serviços", city: "Campina Grande do Sul", rating: 4.4, products: 5, description: "Consultoria em RH e recrutamento." },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = mockCompanies.filter((c) => {
    const matchCat = activeCategory === "Todos" || c.segment === activeCategory;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.segment.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground">Encontre produtos e serviços das empresas associadas.</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar empresa, produto ou serviço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="outline" size="default">
            <Filter className="mr-1 h-4 w-4" /> Filtros
          </Button>
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((company, i) => (
            <motion.div
              key={company.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="group rounded-2xl border border-border bg-card p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {company.name.charAt(0)}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                  {company.segment}
                </span>
              </div>
              <h3 className="mb-1 text-lg font-bold text-card-foreground">{company.name}</h3>
              <p className="mb-3 text-sm text-muted-foreground">{company.description}</p>
              <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  {company.rating}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.city}
                </span>
                <span>{company.products} produtos</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Ver perfil <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            Nenhuma empresa encontrada com esses filtros.
          </div>
        )}
      </div>
    </div>
  );
}
