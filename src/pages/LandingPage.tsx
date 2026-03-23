import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingBag, Handshake, GraduationCap, Trophy, ArrowRight, ArrowUpRight,
  Building2, TrendingUp, Users, Gift, Briefcase, CalendarDays,
  CheckCircle2, Zap, Shield, Star, Smartphone, Download,
} from "lucide-react";
import ActivityFeed from "@/components/landing/ActivityFeed";
import CompanyLogosCarousel from "@/components/landing/CompanyLogosCarousel";

const modules = [
  { title: "Marketplace", description: "Compre e venda produtos e serviços entre empresas da região.", icon: ShoppingBag, href: "/marketplace", accent: "from-primary/20 to-primary/5" },
  { title: "Serviços", description: "Serviços institucionais de apoio ao empresário.", icon: Briefcase, href: "/servicos", accent: "from-muted to-muted/50" },
  { title: "Oportunidades", description: "Encontre fornecedores, parceiros e feche negócios.", icon: Handshake, href: "/oportunidades", accent: "from-accent/20 to-accent/5" },
  { title: "Academia", description: "Cursos e capacitações para sua empresa crescer.", icon: GraduationCap, href: "/academia", accent: "from-secondary/30 to-secondary/10" },
  { title: "Eventos", description: "Networking, feiras e encontros empresariais.", icon: CalendarDays, href: "/eventos", accent: "from-primary/20 to-primary/5" },
  { title: "Benefícios", description: "Descontos e vantagens exclusivas para associados.", icon: Gift, href: "/beneficios", accent: "from-accent/20 to-accent/5" },
  { title: "Ranking", description: "Gamificação e reconhecimento das melhores empresas.", icon: Trophy, href: "/ranking", accent: "from-muted to-muted/50" },
];

const benefits = [
  { icon: Zap, title: "Negócios Rápidos", description: "Conecte-se com fornecedores e compradores da região em minutos." },
  { icon: Shield, title: "Rede Confiável", description: "Todas as empresas são verificadas e aprovadas pela associação." },
  { icon: Star, title: "Capacitação Contínua", description: "Acesso a cursos, eventos e conteúdos exclusivos para crescer." },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.5, ease: "easeOut" as const } }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function LandingPage() {
  const [stats, setStats] = useState({ companies: 0, opportunities: 0, courses: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [profilesRes, oppsRes, coursesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("approved", true),
        supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("active", true),
      ]);
      setStats({
        companies: profilesRes.count || 0,
        opportunities: oppsRes.count || 0,
        courses: coursesRes.count || 0,
      });
    }
    fetchStats();
  }, []);

  const displayStats = [
    { label: "Empresas Associadas", value: stats.companies > 0 ? `${stats.companies}+` : "—", icon: Building2 },
    { label: "Oportunidades Ativas", value: stats.opportunities > 0 ? `${stats.opportunities}` : "—", icon: TrendingUp },
    { label: "Cursos Disponíveis", value: stats.courses > 0 ? `${stats.courses}` : "—", icon: Users },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 via-secondary/85 to-secondary/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_80%_-20%,hsl(var(--primary)/0.15),transparent)]" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-[10%] h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-10 left-[5%] h-48 w-48 rounded-full bg-primary/5 blur-[80px]" />

        <div className="container relative z-10 py-20 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary-foreground/90 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Desde 1988 · Quatro Barras & Campina Grande do Sul
              </div>

              <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-secondary-foreground sm:text-5xl md:text-6xl">
                Conecte sua empresa ao{" "}
                <span className="text-gradient">futuro dos negócios</span>{" "}
                regionais
              </h1>

              <p className="mb-8 max-w-lg text-lg leading-relaxed text-secondary-foreground/70 md:text-xl">
                A plataforma B2B que une empresas de Quatro Barras, Campina Grande do Sul, Colombo, Pinhais e Curitiba. Marketplace, oportunidades, capacitação e muito mais.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/marketplace">
                    Explorar Marketplace <ArrowRight className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="heroOutline" size="xl" asChild>
                  <Link to="/cadastro">Quero me associar</Link>
                </Button>
              </div>

              {/* Quick trust badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-secondary-foreground/50">
                {["Acesso gratuito", "Empresas verificadas", "Suporte dedicado"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary/70" />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right: Stats cards floating */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {displayStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                    className={`${i === 0 ? "ml-0" : i === 1 ? "ml-16 mt-4" : "ml-8 mt-4"} flex items-center gap-4 rounded-2xl border border-border/20 bg-card/10 px-6 py-5 backdrop-blur-xl`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-secondary-foreground">{stat.value}</div>
                      <div className="text-sm text-secondary-foreground/60">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE STATS (shown only on mobile) ===== */}
      <section className="border-b border-border bg-card lg:hidden">
        <div className="container grid grid-cols-3 divide-x divide-border">
          {displayStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="flex flex-col items-center px-3 py-6 text-center"
            >
              <stat.icon className="mb-2 h-5 w-5 text-primary" />
              <div className="text-xl font-extrabold text-foreground">{stat.value}</div>
              <div className="text-[11px] text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== WHY JOIN ===== */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
              Por que participar?
            </span>
            <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">
              Vantagens de fazer parte do ecossistema
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Uma rede empresarial completa para quem quer crescer de verdade na região.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:card-shadow-hover"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <b.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-card-foreground">{b.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MODULES ===== */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
              Plataforma completa
            </span>
            <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">
              Tudo que sua empresa precisa
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Navegue pelos módulos e descubra como a plataforma pode impulsionar seus negócios.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {modules.map((mod, i) => (
              <motion.div key={mod.title} custom={i} variants={fadeInUp}>
                <Link
                  to={mod.href}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:card-shadow-hover"
                >
                  {/* Icon */}
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${mod.accent}`}>
                    <mod.icon className="h-6 w-6 text-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-1.5 text-base font-bold text-card-foreground">{mod.title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{mod.description}</p>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                    Acessar <ArrowUpRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== COMPANY LOGOS ===== */}
      <CompanyLogosCarousel />

      {/* ===== ACTIVITY FEED ===== */}
      <ActivityFeed />

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-secondary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,hsl(var(--primary)/0.2),transparent)]" />

        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
              Comece agora
            </span>
            <h2 className="mb-4 text-3xl font-extrabold text-secondary-foreground md:text-5xl">
              Faça parte do maior ecossistema<br className="hidden md:inline" /> empresarial da região
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-lg text-secondary-foreground/60">
              Junte-se às empresas que já estão gerando negócios na plataforma. Cadastre-se gratuitamente.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/cadastro">
                  Cadastrar minha empresa <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/marketplace">Ver marketplace</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
