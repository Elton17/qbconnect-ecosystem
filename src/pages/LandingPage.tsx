import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  Gift,
  Briefcase,
  CalendarDays,
} from "lucide-react";

const modules = [
  { title: "Marketplace", description: "Compre e venda produtos e serviços entre empresas da região.", icon: ShoppingBag, href: "/marketplace", color: "bg-primary/10 text-primary" },
  { title: "Serviços", description: "Serviços institucionais de apoio ao empresário.", icon: Briefcase, href: "/servicos", color: "bg-muted text-foreground" },
  { title: "Oportunidades", description: "Encontre fornecedores, parceiros e feche negócios.", icon: Handshake, href: "/oportunidades", color: "bg-accent/20 text-accent-foreground" },
  { title: "Academia", description: "Cursos e capacitações para sua empresa crescer.", icon: GraduationCap, href: "/academia", color: "bg-secondary/80 text-secondary-foreground" },
  { title: "Eventos", description: "Networking, feiras e encontros empresariais.", icon: CalendarDays, href: "/eventos", color: "bg-primary/10 text-primary" },
  { title: "Benefícios", description: "Descontos e vantagens exclusivas para associados.", icon: Gift, href: "/beneficios", color: "bg-accent/20 text-accent-foreground" },
  { title: "Ranking", description: "Gamificação e reconhecimento das melhores empresas.", icon: Trophy, href: "/ranking", color: "bg-muted text-foreground" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const } }),
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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/40" />
        <div className="container relative py-24 md:py-36">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <Coins className="h-4 w-4" />
              Desde 1988 · Quatro Barras & Campina Grande do Sul
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-6xl">
              Conecte sua empresa ao{" "}
              <span className="text-gradient">futuro dos negócios</span> regionais
            </h1>
            <p className="mb-8 text-lg text-secondary-foreground/70 md:text-xl">
              A plataforma B2B que une empresas de Quatro Barras, Campina Grande do Sul, Colombo, Pinhais e Curitiba.
              Marketplace, oportunidades, capacitação e muito mais.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="xl" asChild>
                <Link to="/marketplace">Explorar Marketplace <ArrowRight className="ml-1 h-5 w-5" /></Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/cadastro">Quero me associar</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {displayStats.map((stat, i) => (
            <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex items-center gap-4 px-6 py-8">
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-extrabold text-foreground md:text-4xl">Tudo que sua empresa precisa</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Uma plataforma completa para negociar, aprender, crescer e se conectar com as melhores empresas da região.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((mod, i) => (
              <motion.div key={mod.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <Link to={mod.href} className="group block rounded-2xl border border-border bg-card p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1">
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
      <section className="bg-secondary py-20">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="mb-4 text-3xl font-extrabold text-secondary-foreground md:text-4xl">
              Faça parte do maior ecossistema empresarial da região
            </h2>
            <p className="mb-8 text-lg text-secondary-foreground/70">
              Junte-se às empresas que já estão gerando negócios na plataforma.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/cadastro">Cadastrar minha empresa <ArrowRight className="ml-1 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
