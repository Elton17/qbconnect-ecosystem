import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Check, X, Crown, ArrowRight } from "lucide-react";
import { getUpgradeWhatsAppUrl } from "@/lib/plans";

const features = [
  { label: "Acesso completo à plataforma", basic: true, premium: true },
  { label: "Publicação de produtos", basic: "Até 3", premium: "Até 10" },
  { label: "Oportunidades ativas simultâneas", basic: "Até 2", premium: "Até 10" },
  { label: "Benefícios cadastrados", basic: "Até 2", premium: "Ilimitados" },
  { label: "Destaque nas listagens (topo)", basic: false, premium: true },
  { label: "Badge Premium nos cards", basic: false, premium: true },
  { label: "Borda dourada no marketplace", basic: false, premium: true },
  { label: "Selo visual diferenciado", basic: false, premium: true },
  { label: "Cursos e eventos", basic: true, premium: true },
  { label: "Ranking e gamificação", basic: true, premium: true },
  { label: "SAC e suporte", basic: true, premium: true },
];

export default function PlanosPage() {
  usePageTitle("Planos");
  return (
    <div>
      <section className="relative overflow-hidden bg-secondary py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-10 right-10 h-64 w-64 rounded-full bg-amber-400 blur-3xl" />
        </div>
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <Crown className="h-4 w-4" /> Planos QBCAMP Conecta+
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl">
              Escolha o plano ideal para sua <span className="text-gradient">empresa</span>
            </h1>
            <p className="text-lg text-secondary-foreground/70">
              Todos os associados têm acesso completo. O Premium desbloqueia mais capacidade e visibilidade.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Basic */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-1 text-2xl font-extrabold text-card-foreground">Associado</h2>
              <p className="mb-6 text-sm text-muted-foreground">Plano padrão de todo associado QBCAMP</p>
              <div className="mb-6 text-3xl font-extrabold text-foreground">
                Incluído <span className="text-base font-normal text-muted-foreground">na associação</span>
              </div>
              <ul className="space-y-3">
                {features.map((f) => {
                  const val = f.basic;
                  const isTrue = val === true;
                  const isFalse = val === false;
                  return (
                    <li key={f.label} className="flex items-center gap-3 text-sm">
                      {isFalse ? (
                        <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      ) : (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                      <span className={isFalse ? "text-muted-foreground/50" : "text-foreground"}>
                        {f.label} {typeof val === "string" && <span className="font-semibold">({val})</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Premium */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="relative rounded-2xl border-2 border-amber-400 bg-card p-8 shadow-lg shadow-amber-100/20 dark:shadow-amber-900/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-white">
                  <Crown className="h-3 w-3" /> RECOMENDADO
                </span>
              </div>
              <h2 className="mb-1 text-2xl font-extrabold text-card-foreground">Premium</h2>
              <p className="mb-6 text-sm text-muted-foreground">Máxima visibilidade e capacidade</p>
              <div className="mb-6 text-3xl font-extrabold text-foreground">
                Consulte <span className="text-base font-normal text-muted-foreground">condições especiais</span>
              </div>
              <ul className="space-y-3 mb-6">
                {features.map((f) => {
                  const val = f.premium;
                  return (
                    <li key={f.label} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="text-foreground">
                        {f.label} {typeof val === "string" && <span className="font-semibold text-amber-600 dark:text-amber-400">({val})</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <Button className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white" size="lg" asChild>
                <a href={getUpgradeWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                  <Crown className="h-4 w-4" /> Quero ser Premium <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
