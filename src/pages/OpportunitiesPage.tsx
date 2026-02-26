import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Users, Truck, Briefcase, Package, ArrowRight, Calendar } from "lucide-react";
import { useState } from "react";

const types = [
  { label: "Todos", value: "all" },
  { label: "Procuro Fornecedor", value: "fornecedor", icon: Truck },
  { label: "Procuro Parceiro", value: "parceiro", icon: Users },
  { label: "Estou Contratando", value: "contratando", icon: Briefcase },
  { label: "Venda de Estoque", value: "estoque", icon: Package },
];

const mockOpportunities = [
  { id: 1, title: "Procuro fornecedor de aço inox", company: "MetalForge", type: "fornecedor", value: "R$ 50.000", date: "Há 2 dias", urgent: true },
  { id: 2, title: "Parceria para projeto de automação", company: "TechSol Sistemas", type: "parceiro", value: "R$ 120.000", date: "Há 3 dias", urgent: false },
  { id: 3, title: "Vaga para engenheiro civil", company: "ConstroMax", type: "contratando", value: "CLT", date: "Há 1 dia", urgent: true },
  { id: 4, title: "Estoque de madeira tratada", company: "MadeiraViva", type: "estoque", value: "R$ 15.000", date: "Há 5 dias", urgent: false },
  { id: 5, title: "Fornecedor de embalagens sustentáveis", company: "Sabor Regional", type: "fornecedor", value: "R$ 8.000/mês", date: "Hoje", urgent: true },
  { id: 6, title: "Parceiro para clínica móvel", company: "CliniVida", type: "parceiro", value: "A definir", date: "Há 4 dias", urgent: false },
];

const typeColors: Record<string, string> = {
  fornecedor: "bg-primary/10 text-primary",
  parceiro: "bg-accent/20 text-accent-foreground",
  contratando: "bg-secondary/30 text-secondary-foreground",
  estoque: "bg-destructive/10 text-destructive",
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function OpportunitiesPage() {
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockOpportunities.filter((o) => {
    const matchType = activeType === "all" || o.type === activeType;
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) || o.company.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold text-foreground">Oportunidades</h1>
            <p className="text-muted-foreground">Matchmaking empresarial — encontre o parceiro ideal.</p>
          </div>
          <Button variant="default" size="lg">
            Publicar Oportunidade
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar oportunidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Type filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveType(t.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeType === t.value
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.map((opp, i) => (
            <motion.div
              key={opp.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 card-shadow transition-all hover:card-shadow-hover md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[opp.type]}`}>
                    {types.find((t) => t.value === opp.type)?.label}
                  </span>
                  {opp.urgent && (
                    <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                      Urgente
                    </span>
                  )}
                </div>
                <h3 className="mb-1 text-lg font-bold text-card-foreground">{opp.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{opp.company}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{opp.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{opp.value}</div>
                  <div className="text-xs text-muted-foreground">Valor estimado</div>
                </div>
                <Button variant="default" size="sm">
                  Candidatar-se <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            Nenhuma oportunidade encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
