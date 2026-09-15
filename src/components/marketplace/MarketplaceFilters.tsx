import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RotateCcw } from "lucide-react";

export const MARKETPLACE_REGIONS = [
  { name: "Quatro Barras", cities: ["Quatro Barras"] },
  { name: "Campina Grande do Sul", cities: ["Campina Grande do Sul"] },
  { name: "Grande Curitiba", cities: ["Curitiba", "Colombo", "Pinhais", "Piraquara", "São José dos Pinhais"] },
  { name: "Litoral e Serra do Mar", cities: ["Antonina", "Morretes", "Paranaguá"] },
];

export interface FilterState {
  productType: "all" | "product" | "service";
  categories: string[];
  segments: string[];
  regions: string[];
  cities: string[];
  priceMin: string;
  priceMax: string;
}

interface MarketplaceFiltersProps {
  filters: FilterState;
  categories: string[];
  cities: string[];
  segments: string[];
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

export const defaultFilters: FilterState = {
  productType: "all",
  categories: [],
  segments: [],
  regions: [],
  cities: [],
  priceMin: "",
  priceMax: "",
};

function FilterChecks({
  idPrefix,
  items,
  selected,
  onToggle,
}: {
  idPrefix: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  if (items.length === 0) return <p className="pb-3 text-xs text-muted-foreground">Nenhuma opção disponível.</p>;

  return (
    <div className="max-h-44 space-y-2 overflow-y-auto pb-3 pr-1">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2.5">
          <Checkbox id={`${idPrefix}-${item}`} checked={selected.includes(item)} onCheckedChange={() => onToggle(item)} />
          <Label htmlFor={`${idPrefix}-${item}`} className="cursor-pointer text-sm font-normal leading-tight text-foreground">
            {item}
          </Label>
        </div>
      ))}
    </div>
  );
}

export default function MarketplaceFilters({ filters, categories, cities, segments, onChange, onClear }: MarketplaceFiltersProps) {
  const toggle = (key: "categories" | "segments" | "regions" | "cities", value: string) => {
    const current = filters[key];
    onChange({ ...filters, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">Refine sua busca</p>
          <h2 className="font-heading text-lg font-bold text-card-foreground">Filtros</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 px-2 text-xs text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" /> Limpar
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["tipo", "categoria", "regiao", "cidade", "segmento", "preco"]}>
        <AccordionItem value="tipo">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">Tipo de anúncio</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={filters.productType} onValueChange={(value) => onChange({ ...filters, productType: value as FilterState["productType"] })} className="space-y-2 pb-3">
              {[
                { value: "all", label: "Produtos e serviços" },
                { value: "product", label: "Somente produtos" },
                { value: "service", label: "Somente serviços" },
              ].map((option) => (
                <div key={option.value} className="flex items-center gap-2.5">
                  <RadioGroupItem value={option.value} id={`type-${option.value}`} />
                  <Label htmlFor={`type-${option.value}`} className="cursor-pointer text-sm font-normal">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="categoria">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">Categorias</AccordionTrigger>
          <AccordionContent>
            <FilterChecks idPrefix="category" items={categories} selected={filters.categories} onToggle={(value) => toggle("categories", value)} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="regiao">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">Região</AccordionTrigger>
          <AccordionContent>
            <FilterChecks idPrefix="region" items={MARKETPLACE_REGIONS.map((region) => region.name)} selected={filters.regions} onToggle={(value) => toggle("regions", value)} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cidade">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">Cidade</AccordionTrigger>
          <AccordionContent>
            <FilterChecks idPrefix="city" items={cities} selected={filters.cities} onToggle={(value) => toggle("cities", value)} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="segmento">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">Segmento da empresa</AccordionTrigger>
          <AccordionContent>
            <FilterChecks idPrefix="segment" items={segments} selected={filters.segments} onToggle={(value) => toggle("segments", value)} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="preco" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">Faixa de preço</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 pb-2">
              <div>
                <Label htmlFor="price-min" className="mb-1 block text-xs text-muted-foreground">Mínimo</Label>
                <Input id="price-min" type="number" min="0" placeholder="R$ 0" value={filters.priceMin} onChange={(event) => onChange({ ...filters, priceMin: event.target.value })} />
              </div>
              <div>
                <Label htmlFor="price-max" className="mb-1 block text-xs text-muted-foreground">Máximo</Label>
                <Input id="price-max" type="number" min="0" placeholder="R$ 5.000" value={filters.priceMax} onChange={(event) => onChange({ ...filters, priceMax: event.target.value })} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Anúncios com “consultar preço” permanecem visíveis.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}