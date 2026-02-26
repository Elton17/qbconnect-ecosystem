import { motion } from "framer-motion";
import { Trophy, ShoppingBag, GraduationCap, Handshake, Loader2 } from "lucide-react";
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

  if (ranking.length === 0) {
    return (
      <div className="py-8"><div className="container"><h1 className="mb-2 text-3xl font-extrabold text-foreground">Ranking Empresarial</h1><p className="py-16 text-center text-muted-foreground">Nenhuma empresa aprovada ainda.</p></div></div>
    );
  }

  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">Ranking Empresarial</h1>
          <p className="text-muted-foreground">As empresas mais ativas e bem avaliadas da associação.</p>
        </div>

        {/* Top 3 */}
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          {ranking.slice(0, 3).map((company, i) => (
            <motion.div key={company.rank} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center card-shadow ${i === 0 ? "md:-mt-4 md:scale-105 ring-2 ring-accent" : ""}`}>
              <div className="mb-3 text-4xl">{company.badge}</div>
              <div className="mb-1 flex items-center justify-center gap-2">
                <Trophy className={`h-5 w-5 ${i === 0 ? "text-accent" : "text-muted-foreground"}`} />
                <span className="text-sm font-bold text-muted-foreground">#{company.rank}</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-card-foreground">{company.name}</h3>
              <div className="mb-4 text-3xl font-extrabold text-primary">{company.score}</div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
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
                <th className="px-6 py-3 text-left font-semibold text-muted-foreground">#</th>
                <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Empresa</th>
                <th className="px-6 py-3 text-center font-semibold text-muted-foreground">Pontuação</th>
                <th className="hidden px-6 py-3 text-center font-semibold text-muted-foreground md:table-cell">Oportunidades</th>
                <th className="hidden px-6 py-3 text-center font-semibold text-muted-foreground md:table-cell">Cursos</th>
                <th className="hidden px-6 py-3 text-center font-semibold text-muted-foreground lg:table-cell">Benefícios</th>
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
      </div>
    </div>
  );
}
