import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";

const segments = ["Indústria", "Comércio", "Serviços", "Tecnologia", "Saúde", "Construção", "Agronegócio"];
const cities = ["Quatro Barras", "Campina Grande do Sul", "Colombo", "Pinhais", "Piraquara", "Curitiba"];

export interface FilterState {
  productType: string;
  segments: string[];
  priceMin: string;
  priceMax: string;
  cities: string[];
  premiumOnly: boolean;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClear: () => void;
}

export const defaultFilters: FilterState = {
  productType: "all",
  segments: [],
  priceMin: "",
  priceMax: "",
  cities: [],
  premiumOnly: false,
};

export default function MarketplaceFilters({ filters, onChange, onClear }: Props) {
  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  return (
    <div className="space-y-2">
      <Accordion type="multiple" defaultValue={["categoria", "segmento", "preco", "cidade", "plano"]} className="space-y-1">
        <AccordionItem value="categoria" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold py-3">Categoria</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={filters.productType} onValueChange={(v) => onChange({ ...filters, productType: v })} className="space-y-2 pb-3">
              {[
                { value: "all", label: "Todas as categorias" },
                { value: "product", label: "Produtos físicos" },
                { value: "service", label: "Serviços" },
                { value: "plan", label: "Planos corporativos" },
              ].map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <RadioGroupItem value={opt.value} id={`pt-${opt.value}`} />
                  <Label htmlFor={`pt-${opt.value}`} className="text-sm cursor-pointer">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="segmento" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold py-3">Segmento da empresa</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pb-3">
              {segments.map((seg) => (
                <div key={seg} className="flex items-center gap-2">
                  <Checkbox
                    id={`seg-${seg}`}
                    checked={filters.segments.includes(seg)}
                    onCheckedChange={() => onChange({ ...filters, segments: toggleArray(filters.segments, seg) })}
                  />
                  <Label htmlFor={`seg-${seg}`} className="text-sm cursor-pointer">{seg}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="preco" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold py-3">Faixa de preço</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2 pb-3">
              <Input
                type="number"
                placeholder="De R$"
                value={filters.priceMin}
                onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
                className="h-9 text-sm"
              />
              <Input
                type="number"
                placeholder="Até R$"
                value={filters.priceMax}
                onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cidade" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold py-3">Cidade</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pb-3">
              {cities.map((city) => (
                <div key={city} className="flex items-center gap-2">
                  <Checkbox
                    id={`city-${city}`}
                    checked={filters.cities.includes(city)}
                    onCheckedChange={() => onChange({ ...filters, cities: toggleArray(filters.cities, city) })}
                  />
                  <Label htmlFor={`city-${city}`} className="text-sm cursor-pointer">{city}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="plano" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold py-3">Plano do vendedor</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2 pb-3">
              <Checkbox
                id="premium-only"
                checked={filters.premiumOnly}
                onCheckedChange={(c) => onChange({ ...filters, premiumOnly: !!c })}
              />
              <Label htmlFor="premium-only" className="text-sm cursor-pointer flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Apenas Premium
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button variant="outline" size="sm" className="w-full text-primary border-primary hover:bg-primary/5" onClick={onClear}>
        <X className="mr-1 h-3.5 w-3.5" /> Limpar filtros
      </Button>
    </div>
  );
}
