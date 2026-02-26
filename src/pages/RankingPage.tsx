import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp, Star, ShoppingBag, GraduationCap, Handshake } from "lucide-react";

const mockRanking = [
  { rank: 1, name: "TechSol Sistemas", score: 980, sales: 45, deals: 12, courses: 8, badge: "🥇" },
  { rank: 2, name: "Sabor Regional", score: 920, sales: 62, deals: 8, courses: 5, badge: "🥈" },
  { rank: 3, name: "ConstroMax", score: 870, sales: 38, deals: 15, courses: 3, badge: "🥉" },
  { rank: 4, name: "MetalForge", score: 750, sales: 33, deals: 9, courses: 6, badge: "" },
  { rank: 5, name: "CliniVida", score: 680, sales: 18, deals: 7, courses: 10, badge: "" },
  { rank: 6, name: "ConectaRH", score: 620, sales: 12, deals: 5, courses: 4, badge: "" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function RankingPage() {
  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">Ranking Empresarial</h1>
          <p className="text-muted-foreground">As empresas mais ativas e bem avaliadas da associação.</p>
        </div>

        {/* Top 3 highlight */}
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          {mockRanking.slice(0, 3).map((company, i) => (
            <motion.div
              key={company.rank}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center card-shadow ${
                i === 0 ? "md:-mt-4 md:scale-105 ring-2 ring-accent" : ""
              }`}
            >
              <div className="mb-3 text-4xl">{company.badge}</div>
              <div className="mb-1 flex items-center justify-center gap-2">
                <Trophy className={`h-5 w-5 ${i === 0 ? "text-accent" : "text-muted-foreground"}`} />
                <span className="text-sm font-bold text-muted-foreground">#{company.rank}</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-card-foreground">{company.name}</h3>
              <div className="mb-4 text-3xl font-extrabold text-primary">{company.score}</div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>{company.sales} vendas</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Handshake className="h-3.5 w-3.5" />
                  <span>{company.deals} negócios</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{company.courses} cursos</span>
                </div>
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
                <th className="hidden px-6 py-3 text-center font-semibold text-muted-foreground md:table-cell">Vendas</th>
                <th className="hidden px-6 py-3 text-center font-semibold text-muted-foreground md:table-cell">Negócios</th>
                <th className="hidden px-6 py-3 text-center font-semibold text-muted-foreground lg:table-cell">Cursos</th>
              </tr>
            </thead>
            <tbody>
              {mockRanking.map((company, i) => (
                <motion.tr
                  key={company.rank}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-foreground">
                    {company.badge || company.rank}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        {company.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-card-foreground">{company.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-primary">{company.score}</td>
                  <td className="hidden px-6 py-4 text-center text-muted-foreground md:table-cell">{company.sales}</td>
                  <td className="hidden px-6 py-4 text-center text-muted-foreground md:table-cell">{company.deals}</td>
                  <td className="hidden px-6 py-4 text-center text-muted-foreground lg:table-cell">{company.courses}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
