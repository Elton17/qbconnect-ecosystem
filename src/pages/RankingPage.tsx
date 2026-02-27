import { motion } from "framer-motion";
import { Trophy, ShoppingBag, GraduationCap, Handshake, Loader2, Crown, Medal, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface RankedCompany {
  rank: number;
  name: string;
  score: number;
  opportunities: number;
  courses: number;
  benefits: number;
  badge: string;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankedCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      const { data: profiles } = await supabase.from("profiles").select("user_id, company_name").eq("approved", true);
      if (!profiles || profiles.length === 0) { setLoading(false); return; }

      const userIds = profiles.map((p: any) => p.user_id);

      const [{ data: opps }, { data: coursesData }, { data: benefitsData }] = await Promise.all([
        supabase.from("opportunities").select("user_id").eq("active", true).in("user_id", userIds),
        supabase.from("courses").select("user_id").eq("active", true).in("user_id", userIds),
        supabase.from("benefits").select("user_id").eq("active", true).in("user_id", userIds),
      ]);

      const count = (arr: any[] | null, uid: string) => (arr || []).filter((r: any) => r.user_id === uid).length;

      const ranked = profiles.map((p: any) => {
        const o = count(opps, p.user_id);
        const c = count(coursesData, p.user_id);
        const b = count(benefitsData, p.user_id);
        return { name: p.company_name || "Empresa", opportunities: o, courses: c, benefits: b, score: o * 30 + c * 40 + b * 20, rank: 0, badge: "" };
      }).sort((a, b) => b.score - a.score).map((item, i) => ({
        ...item,
        rank: i + 1,
        badge: i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "",
      }));

      setRanking(ranked);
      setLoading(false);
    }
    fetchRanking();
  }, []);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-16 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-1/4 -top-10 h-80 w-80 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-20 left-20 h-60 w-60 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <Trophy className="h-4 w-4" /> Gamificação & Reconhecimento
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl">
              Ranking <span className="text-gradient">Empresarial</span>
            </h1>
            <p className="mb-6 text-lg text-secondary-foreground/70">
              As empresas mais ativas e engajadas da associação QBCAMP.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              { label: "Empresas Rankeadas", value: `${ranking.length}`, icon: Crown },
              { label: "Pontuação Máxima", value: `${ranking[0]?.score || 0}`, icon: Star },
              { label: "Medalhas", value: `${Math.min(ranking.length, 3)}`, icon: Medal },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 px-5 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-secondary-foreground">{stat.value}</div>
                  <div className="text-xs text-secondary-foreground/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="container py-10">
        {ranking.length === 0 ? (
          <div className="py-16 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhuma empresa aprovada ainda.</p>
          </div>
        ) : (
          <>
            {/* Top 3 */}
            <div className="mb-10 grid gap-6 md:grid-cols-3">
              {ranking.slice(0, 3).map((company, i) => (
                <motion.div key={company.rank} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center card-shadow transition-all hover:card-shadow-hover ${i === 0 ? "md:-mt-4 md:scale-105 ring-2 ring-accent" : ""}`}>
                  <div className="mb-3 text-5xl">{company.badge}</div>
                  <div className="mb-1 flex items-center justify-center gap-2">
                    <Trophy className={`h-5 w-5 ${i === 0 ? "text-accent" : "text-muted-foreground"}`} />
                    <span className="text-sm font-bold text-muted-foreground">#{company.rank}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-card-foreground">{company.name}</h3>
                  <div className="mb-4 text-3xl font-extrabold text-primary">{company.score}</div>
                  <div className="text-xs text-muted-foreground">pontos</div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                    <div className="flex flex-col items-center gap-1"><ShoppingBag className="h-3.5 w-3.5" /><span>{company.opportunities} oport.</span></div>
                    <div className="flex flex-col items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /><span>{company.courses} cursos</span></div>
                    <div className="flex flex-col items-center gap-1"><Handshake className="h-3.5 w-3.5" /><span>{company.benefits} benef.</span></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border bg-card card-shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">#</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Empresa</th>
                    <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Pontuação</th>
                    <th className="hidden px-6 py-4 text-center font-semibold text-muted-foreground md:table-cell">Oportunidades</th>
                    <th className="hidden px-6 py-4 text-center font-semibold text-muted-foreground md:table-cell">Cursos</th>
                    <th className="hidden px-6 py-4 text-center font-semibold text-muted-foreground lg:table-cell">Benefícios</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((company, i) => (
                    <motion.tr key={company.rank} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{company.badge || company.rank}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">{company.name.charAt(0)}</div>
                          <span className="font-semibold text-card-foreground">{company.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-primary">{company.score}</td>
                      <td className="hidden px-6 py-4 text-center text-muted-foreground md:table-cell">{company.opportunities}</td>
                      <td className="hidden px-6 py-4 text-center text-muted-foreground md:table-cell">{company.courses}</td>
                      <td className="hidden px-6 py-4 text-center text-muted-foreground lg:table-cell">{company.benefits}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
