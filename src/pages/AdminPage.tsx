import { motion } from "framer-motion";
import {
  Building2,
  ShoppingBag,
  Handshake,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const statsCards = [
  { label: "Empresas Ativas", value: "124", icon: Building2, change: "+8 este mês" },
  { label: "Volume Transacionado", value: "R$ 285K", icon: DollarSign, change: "+12% vs mês anterior" },
  { label: "Comissão Gerada", value: "R$ 18.5K", icon: TrendingUp, change: "+9% vs mês anterior" },
  { label: "Negócios Fechados", value: "47", icon: Handshake, change: "+15 este mês" },
];

const pendingApprovals = [
  { id: 1, type: "Empresa", name: "Nova Construtora LTDA", date: "Hoje" },
  { id: 2, type: "Produto", name: "Serviço de consultoria – ConectaRH", date: "Há 1 dia" },
  { id: 3, type: "Curso", name: "Excel Avançado – TechSol", date: "Há 2 dias" },
];

const recentTransactions = [
  { id: 1, buyer: "ConstroMax", seller: "MetalForge", value: "R$ 12.500", commission: "R$ 875", date: "Hoje" },
  { id: 2, buyer: "Sabor Regional", seller: "PackLogística", value: "R$ 3.200", commission: "R$ 224", date: "Ontem" },
  { id: 3, buyer: "CliniVida", seller: "TechSol Sistemas", value: "R$ 8.000", commission: "R$ 560", date: "Há 2 dias" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function AdminPage() {
  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground">Visão geral da plataforma QBCAMP Conecta+.</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="rounded-2xl border border-border bg-card p-5 card-shadow"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-extrabold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="mt-1 text-xs text-primary font-medium">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending approvals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-6 card-shadow"
          >
            <h2 className="mb-4 text-lg font-bold text-card-foreground">Aprovações Pendentes</h2>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <span className="mb-1 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                      {item.type}
                    </span>
                    <div className="text-sm font-semibold text-card-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.date}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Aprovar
                    </Button>
                    <Button size="sm" variant="outline">
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 card-shadow"
          >
            <h2 className="mb-4 text-lg font-bold text-card-foreground">Transações Recentes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-semibold text-muted-foreground">Comprador</th>
                    <th className="pb-2 text-left font-semibold text-muted-foreground">Vendedor</th>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">Valor</th>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">Comissão</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0">
                      <td className="py-3 text-card-foreground">{tx.buyer}</td>
                      <td className="py-3 text-card-foreground">{tx.seller}</td>
                      <td className="py-3 text-right font-semibold text-foreground">{tx.value}</td>
                      <td className="py-3 text-right font-medium text-primary">{tx.commission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
