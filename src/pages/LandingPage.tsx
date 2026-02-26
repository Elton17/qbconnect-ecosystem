import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Handshake,
  GraduationCap,
  Trophy,
  ArrowRight,
  Building2,
  TrendingUp,
  Users,
  Coins,
} from "lucide-react";

const stats = [
  { label: "Empresas Associadas", value: "120+", icon: Building2 },
  { label: "Negócios Fechados", value: "R$ 2M+", icon: TrendingUp },
  { label: "Oportunidades Ativas", value: "350+", icon: Users },
];

const modules = [
  {
    title: "Marketplace",
    description: "Compre e venda produtos e serviços entre empresas da região.",
    icon: ShoppingBag,
    href: "/marketplace",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Oportunidades",
    description: "Encontre fornecedores, parceiros e feche negócios.",
    icon: Handshake,
    href: "/oportunidades",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    title: "Academia",
    description: "Cursos e capacitações para sua empresa crescer.",
    icon: GraduationCap,
    href: "/academia",
    color: "bg-secondary/20 text-secondary-foreground",
  },
  {
    title: "Ranking",
    description: "Gamificação e reconhecimento das melhores empresas.",
    icon: Trophy,
    href: "/ranking",
    color: "bg-primary/10 text-primary",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgOHYtMmgydjJoLTJ6bTIgMGgtMnYtMmgydjJ6bTItMnYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground/80">
              <Coins className="h-4 w-4" />
              Ecossistema Digital Empresarial
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground md:text-6xl">
              Conecte sua empresa ao{" "}
              <span className="text-gradient">futuro dos negócios</span> regionais
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/70 md:text-xl">
              A plataforma B2B que une empresas de Quatro Barras e Campina Grande do Sul.
              Marketplace, oportunidades, capacitação e muito mais.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/marketplace">
                  Explorar Marketplace
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl">
                Quero me associar
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="flex items-center gap-4 px-6 py-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 text-3xl font-extrabold text-foreground md:text-4xl">
              Tudo que sua empresa precisa
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Uma plataforma completa para negociar, aprender, crescer e se conectar com as melhores empresas da região.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <Link
                  to={mod.href}
                  className="group block rounded-2xl border border-border bg-card p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${mod.color}`}>
                    <mod.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-card-foreground">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground">{mod.description}</p>
                  <div className="mt-4 flex items-center text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Explorar <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-20">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-extrabold text-primary-foreground md:text-4xl">
              Faça parte do maior ecossistema empresarial da região
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/70">
              Junte-se a mais de 120 empresas que já estão gerando negócios na plataforma.
            </p>
            <Button variant="hero" size="xl">
              Cadastrar minha empresa
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
