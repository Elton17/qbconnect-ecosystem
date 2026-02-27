import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Loader2, ShoppingBag, GraduationCap, Handshake, Gift, CalendarDays, Users, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

interface DashboardStats {
  products: number;
  courses: number;
  opportunities: number;
  benefits: number;
  events: number;
  enrollments: number;
  eventRegistrations: number;
}

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const [products, courses, opportunities, benefits, events, profile] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("benefits").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("profiles").select("company_name").eq("user_id", user!.id).single(),
      ]);

      // Get enrollment count on user's courses
      const { data: userCourses } = await supabase.from("courses").select("id").eq("user_id", user!.id);
      const courseIds = (userCourses || []).map(c => c.id);
      let enrollments = 0;
      if (courseIds.length > 0) {
        const { count } = await supabase.from("course_enrollments").select("id", { count: "exact", head: true }).in("course_id", courseIds);
        enrollments = count || 0;
      }

      // Get event registration count
      const { data: userEvents } = await supabase.from("events").select("id").eq("user_id", user!.id);
      const eventIds = (userEvents || []).map(e => e.id);
      let eventRegistrations = 0;
      if (eventIds.length > 0) {
        const { count } = await supabase.from("event_registrations").select("id", { count: "exact", head: true }).in("event_id", eventIds);
        eventRegistrations = count || 0;
      }

      setCompanyName(profile.data?.company_name || "Minha Empresa");
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
    fetch();
  }, [user]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const cards = [
    { label: "Produtos", value: stats?.products || 0, icon: ShoppingBag, color: "bg-primary/10 text-primary" },
    { label: "Cursos", value: stats?.courses || 0, icon: GraduationCap, color: "bg-accent/10 text-accent" },
    { label: "Oportunidades", value: stats?.opportunities || 0, icon: Handshake, color: "bg-secondary text-secondary-foreground" },
    { label: "Benefícios", value: stats?.benefits || 0, icon: Gift, color: "bg-primary/10 text-primary" },
    { label: "Eventos", value: stats?.events || 0, icon: CalendarDays, color: "bg-accent/10 text-accent" },
    { label: "Alunos Inscritos", value: stats?.enrollments || 0, icon: Users, color: "bg-muted text-foreground" },
    { label: "Participantes Eventos", value: stats?.eventRegistrations || 0, icon: TrendingUp, color: "bg-primary/10 text-primary" },
  ];

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
            <p className="text-sm text-muted-foreground">{companyName} · Visão geral</p>
          </div>
        </div>

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
      </motion.div>
    </div>
  );
}
