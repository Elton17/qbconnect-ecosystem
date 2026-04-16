import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, Loader2, BookOpen, Users, Award, TrendingUp,
  Clock, Star, Trophy, GraduationCap
} from "lucide-react";

interface CourseReport {
  id: string;
  title: string;
  category: string;
  premium: boolean;
  enrollments: number;
  completionRate: number;
  avgRating: number;
  reviewCount: number;
  lessonCount: number;
  certificateCount: number;
  totalWatchSeconds: number;
}

export default function AdminCourseReports() {
  const [reports, setReports] = useState<CourseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUsers30d, setActiveUsers30d] = useState(0);

  useEffect(() => { fetchReports(); }, []);

  async function fetchReports() {
    setLoading(true);

    const [coursesRes, enrollRes, modulesRes, reviewsRes, certsRes] = await Promise.all([
      supabase.from("courses").select("id, title, category, premium"),
      supabase.from("course_enrollments").select("course_id, user_id"),
      supabase.from("course_modules").select("id, course_id"),
      supabase.from("course_reviews").select("course_id, rating"),
      supabase.from("certificates").select("course_id"),
    ]);

    const allCourses = coursesRes.data || [];
    const enrollments = enrollRes.data || [];
    const modules = modulesRes.data || [];
    const reviews = reviewsRes.data || [];
    const certs = certsRes.data || [];

    // Get lessons
    const moduleIds = modules.map((m: any) => m.id);
    let lessonsByModule: Record<string, string[]> = {};
    if (moduleIds.length > 0) {
      const { data: lessons } = await supabase.from("course_lessons").select("id, module_id").in("module_id", moduleIds);
      (lessons || []).forEach((l: any) => {
        if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = [];
        lessonsByModule[l.module_id].push(l.id);
      });
    }

    const courseLessonIds: Record<string, string[]> = {};
    modules.forEach((m: any) => {
      if (!courseLessonIds[m.course_id]) courseLessonIds[m.course_id] = [];
      courseLessonIds[m.course_id].push(...(lessonsByModule[m.id] || []));
    });

    // Get progress
    const allLessonIds = Object.values(courseLessonIds).flat();
    let progressData: any[] = [];
    if (allLessonIds.length > 0) {
      const { data } = await supabase.from("lesson_progress")
        .select("user_id, lesson_id, completed, progress_seconds, updated_at");
      progressData = data || [];
    }

    // Active users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const activeUserIds = new Set(
      progressData.filter((p: any) => p.updated_at && p.updated_at > thirtyDaysAgo).map((p: any) => p.user_id)
    );
    setActiveUsers30d(activeUserIds.size);

    // Aggregate per course
    const courseReports: CourseReport[] = allCourses.map((c: any) => {
      const cEnrollments = enrollments.filter((e: any) => e.course_id === c.id);
      const cReviews = reviews.filter((r: any) => r.course_id === c.id);
      const cCerts = certs.filter((cert: any) => cert.course_id === c.id);
      const cLessonIds = courseLessonIds[c.id] || [];

      // Completion rate
      let completionRate = 0;
      if (cEnrollments.length > 0 && cLessonIds.length > 0) {
        const completedUsers = cEnrollments.filter((e: any) => {
          const userCompleted = progressData.filter(
            (p: any) => p.user_id === e.user_id && cLessonIds.includes(p.lesson_id) && p.completed
          ).length;
          return userCompleted === cLessonIds.length;
        }).length;
        completionRate = Math.round((completedUsers / cEnrollments.length) * 100);
      }

      // Watch time
      const totalWatchSeconds = progressData
        .filter((p: any) => cLessonIds.includes(p.lesson_id) && p.progress_seconds)
        .reduce((s: number, p: any) => s + (p.progress_seconds || 0), 0);

      const avgRating = cReviews.length > 0
        ? cReviews.reduce((s: number, r: any) => s + r.rating, 0) / cReviews.length
        : 0;

      return {
        id: c.id,
        title: c.title,
        category: c.category || "",
        premium: c.premium || false,
        enrollments: cEnrollments.length,
        completionRate,
        avgRating,
        reviewCount: cReviews.length,
        lessonCount: cLessonIds.length,
        certificateCount: cCerts.length,
        totalWatchSeconds,
      };
    });

    courseReports.sort((a, b) => b.enrollments - a.enrollments);
    setReports(courseReports);
    setLoading(false);
  }

  const totals = useMemo(() => ({
    courses: reports.length,
    enrollments: reports.reduce((s, r) => s + r.enrollments, 0),
    certificates: reports.reduce((s, r) => s + r.certificateCount, 0),
    avgCompletion: reports.length > 0
      ? Math.round(reports.reduce((s, r) => s + r.completionRate, 0) / reports.length)
      : 0,
    totalWatchHours: Math.round(reports.reduce((s, r) => s + r.totalWatchSeconds, 0) / 3600),
    avgRating: (() => {
      const rated = reports.filter((r) => r.avgRating > 0);
      return rated.length > 0 ? (rated.reduce((s, r) => s + r.avgRating, 0) / rated.length).toFixed(1) : "—";
    })(),
  }), [reports]);

  const formatHours = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" /> Relatórios da Escola de Negócios
      </h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Cursos", value: totals.courses, icon: BookOpen, color: "text-primary" },
          { label: "Matrículas", value: totals.enrollments, icon: Users, color: "text-primary" },
          { label: "Certificados", value: totals.certificates, icon: Award, color: "text-accent" },
          { label: "Taxa Conclusão", value: `${totals.avgCompletion}%`, icon: TrendingUp, color: "text-emerald-500" },
          { label: "Horas Assistidas", value: `${totals.totalWatchHours}h`, icon: Clock, color: "text-blue-500" },
          { label: "Usuários Ativos (30d)", value: activeUsers30d, icon: Users, color: "text-amber-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <stat.icon className={`mx-auto mb-1.5 h-5 w-5 ${stat.color}`} />
            <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Top courses */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" /> Ranking de Cursos (por matrículas)
        </h3>

        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum curso cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">#</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Curso</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground">Matrículas</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground">Aulas</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground">Conclusão</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground">Avaliação</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground">Certificados</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground">Tempo Total</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2.5 text-muted-foreground font-bold">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-card-foreground max-w-[200px] truncate">{r.title}</span>
                        {r.premium && <Badge className="text-[10px] bg-amber-500">Premium</Badge>}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{r.category}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-foreground">{r.enrollments}</td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground">{r.lessonCount}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={r.completionRate} className="w-16 h-1.5" />
                        <span className="text-xs font-bold text-foreground">{r.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {r.avgRating > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          <span className="text-sm font-bold">{r.avgRating.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({r.reviewCount})</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {r.certificateCount > 0 ? (
                        <Badge variant="secondary">{r.certificateCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                      {formatHours(r.totalWatchSeconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Avg rating overall */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-accent" /> Avaliação Geral
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-extrabold text-foreground">{totals.avgRating}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${
                    Number(totals.avgRating) >= s ? "fill-accent text-accent" : "text-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Baseado em {reports.reduce((s, r) => s + r.reviewCount, 0)} avaliações
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" /> Cursos por Categoria
          </h3>
          <div className="space-y-2">
            {Object.entries(
              reports.reduce<Record<string, number>>((acc, r) => {
                acc[r.category || "Sem categoria"] = (acc[r.category || "Sem categoria"] || 0) + 1;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-card-foreground">{cat}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
