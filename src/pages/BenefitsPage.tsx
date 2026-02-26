import { motion } from "framer-motion";
import { Gift, Percent, Building2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockBenefits = [
  { id: 1, company: "TechSol Sistemas", offer: "20% de desconto em consultoria de TI", category: "Tecnologia", exclusive: true },
  { id: 2, company: "Sabor Regional", offer: "Kit degustação grátis no primeiro pedido", category: "Alimentação", exclusive: false },
  { id: 3, company: "ConstroMax", offer: "Frete grátis para pedidos acima de R$ 5.000", category: "Construção", exclusive: true },
  { id: 4, company: "CliniVida", offer: "Pacote saúde empresarial com 30% off", category: "Saúde", exclusive: true },
  { id: 5, company: "ConectaRH", offer: "Primeira vaga publicada sem custo", category: "Serviços", exclusive: false },
  { id: 6, company: "MetalForge", offer: "Condição especial para lotes acima de 100un", category: "Indústria", exclusive: false },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function BenefitsPage() {
  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">Clube de Benefícios</h1>
          <p className="text-muted-foreground">Descontos e condições exclusivas entre empresas associadas.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockBenefits.map((benefit, i) => (
            <motion.div
              key={benefit.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="rounded-2xl border border-border bg-card p-6 card-shadow transition-all hover:card-shadow-hover hover:-translate-y-1"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                  <Percent className="h-6 w-6 text-accent-foreground" />
                </div>
                {benefit.exclusive && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Exclusivo Premium
                  </span>
                )}
              </div>
              <h3 className="mb-1 text-base font-bold text-card-foreground">{benefit.offer}</h3>
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {benefit.company}
                <span className="ml-auto flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  {benefit.category}
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Resgatar benefício
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
