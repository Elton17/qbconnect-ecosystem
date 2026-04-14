import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Loader2, ShoppingBag, GraduationCap, Handshake, Gift, CalendarDays, Users, TrendingUp, BarChart3, Crown, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PremiumBadge from "@/components/PremiumBadge";
import { getPlanLimits, getUpgradeWhatsAppUrl } from "@/lib/plans";
import { format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardStats {
  products: number;
  courses: number;
  opportunities: number;
  benefits: number;
  events: number;
  enrollments: number;
  eventRegistrations: number;
}

interface MonthlyData {
  month: string;
  alunos: number;
  eventos: number;
}

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [plan, setPlan] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const [products, courses, opportunities, benefits, events, profile] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("active", true),
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("active", true).eq("status", "open"),
        supabase.from("benefits").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("active", true),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("profiles").select("company_name, plan").eq("user_id", user!.id).single(),
      ]);

      setCompanyName(profile.data?.company_name || "Minha Empresa");
      setPlan(profile.data?.plan || "basic");

      const [{ data: userCourses }, { data: userEvents }] = await Promise.all([
        supabase.from("courses").select("id").eq("user_id", user!.id),
        supabase.from("events").select("id").eq("user_id", user!.id),
      ]);

      const courseIds = (userCourses || []).map(c => c.id);
      const eventIds = (userEvents || []).map(e => e.id);

      let enrollments = 0;
      let eventRegistrations = 0;
      let enrollmentRows: { enrolled_at: string | null }[] = [];
      let registrationRows: { created_at: string | null }[] = [];

      if (courseIds.length > 0) {
        const [countRes, rowsRes] = await Promise.all([
          supabase.from("course_enrollments").select("id", { count: "exact", head: true }).in("course_id", courseIds),
          supabase.from("course_enrollments").select("enrolled_at").in("course_id", courseIds),
        ]);
        enrollments = countRes.count || 0;
        enrollmentRows = rowsRes.data || [];
      }

      if (eventIds.length > 0) {
        const [countRes, rowsRes] = await Promise.all([
          supabase.from("event_registrations").select("id", { count: "exact", head: true }).in("event_id", eventIds),
          supabase.from("event_registrations").select("created_at").in("event_id", eventIds),
        ]);
        eventRegistrations = countRes.count || 0;
        registrationRows = rowsRes.data || [];
      }

      const months: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const nextMonth = startOfMonth(subMonths(new Date(), i - 1));
        const label = format(date, "MMM yy", { locale: ptBR });
        const alunos = enrollmentRows.filter(r => { if (!r.enrolled_at) return false; const d = new Date(r.enrolled_at); return d >= monthStart && d < nextMonth; }).length;
        const eventos = registrationRows.filter(r => { if (!r.created_at) return false; const d = new Date(r.created_at); return d >= monthStart && d < nextMonth; }).length;
        months.push({ month: label, alunos, eventos });
      }

      setMonthlyData(months);
      setStats({
        products: products.count || 0,
        courses: courses.count || 0,
        opportunities: opportunities.count || 0,
        benefits: benefits.count || 0,
        events: events.count || 0,
        enrollments,
        eventRegistrations,
      });
      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const limits = getPlanLimits(plan);
  const isPremium = plan === "premium";

  const cards = [
    { label: "Produtos", value: stats?.products || 0, icon: ShoppingBag, color: "bg-primary/10 text-primary" },
    { label: "Cursos", value: stats?.courses || 0, icon: GraduationCap, color: "bg-accent/10 text-accent" },
    { label: "Oportunidades", value: stats?.opportunities || 0, icon: Handshake, color: "bg-secondary text-secondary-foreground" },
    { label: "Benefícios", value: stats?.benefits || 0, icon: Gift, color: "bg-primary/10 text-primary" },
    { label: "Eventos", value: stats?.events || 0, icon: CalendarDays, color: "bg-accent/10 text-accent" },
    { label: "Alunos Inscritos", value: stats?.enrollments || 0, icon: Users, color: "bg-muted text-foreground" },
    { label: "Participantes Eventos", value: stats?.eventRegistrations || 0, icon: TrendingUp, color: "bg-primary/10 text-primary" },
  ];

  const chartConfig = {
    alunos: { label: "Novos Alunos", color: "hsl(var(--primary))" },
    eventos: { label: "Inscrições Eventos", color: "hsl(var(--accent))" },
  };

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: "Meu Perfil", href: "/perfil" }, { label: "Dashboard" }]} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{companyName}</p>
              {isPremium ? <PremiumBadge /> : <Badge variant="secondary" className="text-xs">Associado</Badge>}
            </div>
          </div>
        </div>

        {/* Plan usage section */}
        <Card className={`mb-6 ${isPremium ? "border-2 border-amber-400" : ""}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {isPremium ? <Crown className="h-5 w-5 text-amber-500" /> : <Crown className="h-5 w-5 text-muted-foreground" />}
              Uso do Plano — {isPremium ? "Premium" : "Associado"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Produtos ativos</span>
                <span className="font-semibold text-foreground">{stats?.products || 0}/{limits.products === Infinity ? "∞" : limits.products}</span>
              </div>
              <Progress value={limits.products === Infinity ? 10 : ((stats?.products || 0) / limits.products) * 100} className="h-2" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Oportunidades ativas</span>
                <span className="font-semibold text-foreground">{stats?.opportunities || 0}/{limits.opportunities === Infinity ? "∞" : limits.opportunities}</span>
              </div>
              <Progress value={limits.opportunities === Infinity ? 10 : ((stats?.opportunities || 0) / limits.opportunities) * 100} className="h-2" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Benefícios ativos</span>
                <span className="font-semibold text-foreground">{stats?.benefits || 0}/{limits.benefits === Infinity ? "∞" : limits.benefits}</span>
              </div>
              <Progress value={limits.benefits === Infinity ? 10 : ((stats?.benefits || 0) / limits.benefits) * 100} className="h-2" />
            </div>
            {!isPremium && (
              <Button className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white" asChild>
                <a href={getUpgradeWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                  <Crown className="h-4 w-4" /> Fazer Upgrade para Premium <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="card-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.color}`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-foreground">{card.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-8">
          <Tabs defaultValue="alunos">
            <TabsList>
              <TabsTrigger value="alunos">Novos Alunos</TabsTrigger>
              <TabsTrigger value="eventos">Inscrições Eventos</TabsTrigger>
              <TabsTrigger value="ambos">Comparativo</TabsTrigger>
            </TabsList>

            <TabsContent value="alunos">
              <Card>
                <CardHeader><CardTitle className="text-base">Novos alunos por mês</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis allowDecimals={false} className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="alunos" fill="var(--color-alunos)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="eventos">
              <Card>
                <CardHeader><CardTitle className="text-base">Inscrições em eventos por mês</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis allowDecimals={false} className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="eventos" fill="var(--color-eventos)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ambos">
              <Card>
                <CardHeader><CardTitle className="text-base">Comparativo mensal</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis allowDecimals={false} className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="alunos" stroke="var(--color-alunos)" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="eventos" stroke="var(--color-eventos)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
