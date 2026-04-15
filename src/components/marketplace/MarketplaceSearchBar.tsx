import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickCategories = [
  "Todos", "Indústria", "Comércio", "Serviços", "Tecnologia", "Saúde", "Construção", "Agronegócio"
];

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  activeCategory: string;
  onCategoryChange: (v: string) => void;
}

export default function MarketplaceSearchBar({ search, onSearchChange, activeCategory, onCategoryChange }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-0 rounded-xl bg-card shadow-md border border-border overflow-hidden" style={{ height: 56 }}>
        <div className="relative flex-1 h-full">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar produtos, serviços ou empresas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-full w-full bg-transparent pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <Button
          className="h-full rounded-none px-8 text-base font-bold"
          onClick={() => {}}
        >
          Buscar
        </Button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {quickCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-foreground hover:ring-1 hover:ring-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
