import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingBag, Handshake, GraduationCap, Trophy, ArrowRight, ArrowUpRight,
  Building2, TrendingUp, Users, Gift, Briefcase, CalendarDays,
  CheckCircle2, Zap, Shield, Star, Smartphone, Download, Crown, Check,
} from "lucide-react";
import ActivityFeed from "@/components/landing/ActivityFeed";
import CompanyLogosCarousel from "@/components/landing/CompanyLogosCarousel";
import PromotionsSection from "@/components/marketplace/PromotionsSection";

const modules = [
  { title: "Marketplace", description: "Compre e venda produtos e serviços entre empresas da região.", icon: ShoppingBag, href: "/marketplace" },
  { title: "Serviços", description: "Serviços institucionais de apoio ao empresário.", icon: Briefcase, href: "/servicos" },
  { title: "Oportunidades", description: "Encontre fornecedores, parceiros e feche negócios.", icon: Handshake, href: "/oportunidades" },
  { title: "Escola de Negócios", description: "Cursos e capacitações para sua empresa crescer.", icon: GraduationCap, href: "/academia" },
  { title: "Eventos", description: "Networking, feiras e encontros empresariais.", icon: CalendarDays, href: "/eventos" },
  { title: "Benefícios", description: "Descontos e vantagens exclusivas para associados.", icon: Gift, href: "/beneficios" },
  { title: "Ranking", description: "Gamificação e reconhecimento das melhores empresas.", icon: Trophy, href: "/ranking" },
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
  usePageTitle("Início");
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
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, rgba(26,26,26,0.92) 40%, rgba(26,26,26,0.60) 100%)"
        }} />

        <div className="container relative z-10 py-20 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Desde 1988 · Quatro Barras & Campina Grande do Sul
              </div>

              {/* H1 */}
              <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl font-heading">
                <span className="text-white">Sua parceira no</span><br />
                <span className="text-primary">desenvolvimento</span><br />
                <span className="text-white">empresarial.</span>
              </h1>

              <p className="mb-8 max-w-lg text-lg leading-relaxed text-white/70 md:text-xl">
                A plataforma B2B que une empresas de Quatro Barras, Campina Grande do Sul, Colombo, Pinhais e Curitiba. Marketplace, oportunidades, capacitação e muito mais.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="xl" asChild className="bg-primary text-white hover:bg-primary-dark font-heading font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  <Link to="/marketplace">
                    Explorar Marketplace <ArrowRight className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" asChild className="border-2 border-white/50 text-white bg-transparent hover:border-white hover:bg-white/10 backdrop-blur-sm font-heading font-bold">
                  <a href="https://qbcamp.com.br/filiacao" target="_blank" rel="noopener noreferrer">Quero me associar</a>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/50">
                {["Acesso gratuito", "Empresas verificadas", "Suporte dedicado"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary/70" />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Stats cards */}
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
                    className={`${i === 0 ? "ml-0" : i === 1 ? "ml-16 mt-4" : "ml-8 mt-4"} flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-6 py-5 backdrop-blur-xl`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-primary font-heading">{stat.value}</div>
                      <div className="text-sm text-white/70">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE STATS ===== */}
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
              <div className="text-xl font-extrabold text-foreground font-heading">{stat.value}</div>
              <div className="text-[11px] text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ===== PROMOÇÕES BANNER ===== */}
      <PromotionsSection compact />

      {/* ===== WHY JOIN ===== */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-primary font-heading">
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
                className="group relative rounded-lg border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <b.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-card-foreground">{b.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 text-center">
            <Button size="xl" asChild className="bg-primary text-white hover:bg-primary-dark font-heading font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Link to="/cadastro">
                <Building2 className="mr-2 h-5 w-5" /> Cadastre sua Empresa <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== MODULES ===== */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-primary font-heading">
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
                  className="group relative flex flex-col rounded-lg border-l-4 border-l-primary border border-border bg-card p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {/* Icon */}
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <mod.icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="mb-1.5 text-base font-bold text-card-foreground">{mod.title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{mod.description}</p>

                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                    Acessar <ArrowUpRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="xl" asChild className="bg-primary text-white hover:bg-primary-dark font-heading font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Link to="/cadastro">
                Cadastre sua Empresa <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="font-heading font-bold">
              <a href="https://qbcamp.com.br/filiacao" target="_blank" rel="noopener noreferrer">Quero me associar</a>
            </Button>
          </motion.div>
        </div>
      </section>


      {/* ===== COMPANY LOGOS ===== */}
      <CompanyLogosCarousel />

      {/* ===== ACTIVITY FEED ===== */}
      <ActivityFeed />

      {/* ===== APP DOWNLOAD BANNER ===== */}
      <section className="py-16 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-lg border border-primary/20 bg-secondary p-8 md:p-12"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-[80px]" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />

            <div className="relative flex flex-col items-center gap-8 md:flex-row md:justify-between">
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                  <Smartphone className="h-4 w-4" />
                  Novo! App Mobile
                </div>
                <h2 className="mb-3 text-2xl font-extrabold text-white md:text-3xl">
                  QBCAMP no seu <span className="text-primary">celular</span>
                </h2>
                <p className="mb-6 max-w-md text-white/60">
                  Instale o app direto do navegador — sem loja, sem ocupar espaço. Acesso rápido a toda a plataforma.
                </p>
                <Button size="xl" asChild className="bg-primary text-white hover:bg-primary-dark font-heading font-bold shadow-lg">
                  <Link to="/instalar">
                    <Download className="mr-1.5 h-5 w-5" /> Instalar o App
                  </Link>
                </Button>
              </div>

              <div className="flex shrink-0 gap-3">
                {[
                  { icon: Smartphone, label: "Como um app nativo" },
                  { icon: Zap, label: "Rápido e leve" },
                  { icon: Shield, label: "Funciona offline" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-5 backdrop-blur-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-white/70 text-center">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

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
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary font-heading">
              Comece agora
            </span>
            <h2 className="mb-4 text-3xl font-extrabold text-white md:text-5xl">
              Faça parte do maior ecossistema<br className="hidden md:inline" /> empresarial da região
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-lg text-white/60">
              Junte-se às empresas que já estão gerando negócios na plataforma. Cadastre-se gratuitamente.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="xl" asChild className="bg-primary text-white hover:bg-primary-dark font-heading font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <Link to="/cadastro">
                  Cadastrar minha empresa <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" asChild className="border-2 border-white/50 text-white bg-transparent hover:border-white hover:bg-white/10 font-heading font-bold">
                <Link to="/marketplace">Ver marketplace</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}