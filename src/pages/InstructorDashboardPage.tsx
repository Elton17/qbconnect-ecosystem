import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, BookOpen, Users, Star, TrendingUp, Award,
  BarChart3, Loader2, Eye, Settings, GraduationCap, ChevronRight
} from "lucide-react";

interface CourseMetrics {
  id: string;
  title: string;
  category: string;
  premium: boolean;
  created_at: string;
  enrollments: number;
  avgProgress: number;
  avgRating: number;
  reviewCount: number;
  lessonCount: number;
  certificateCount: number;
}

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMetrics();
  }, [user]);

  const fetchMetrics = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch instructor's courses
    const { data: myCourses } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!myCourses || myCourses.length === 0) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const courseIds = myCourses.map((c: any) => c.id);

    // Parallel fetches
    const [enrollRes, modulesRes, reviewsRes, certsRes] = await Promise.all([
      supabase.from("course_enrollments").select("course_id, user_id").in("course_id", courseIds),
      supabase.from("course_modules").select("id, course_id").in("course_id", courseIds),
      supabase.from("course_reviews").select("course_id, rating").in("course_id", courseIds),
      supabase.from("certificates").select("course_id").in("course_id", courseIds),
    ]);

    const enrollments = enrollRes.data || [];
    const modules = modulesRes.data || [];
    const reviews = reviewsRes.data || [];
    const certificates = certsRes.data || [];

    // Get lessons per module
    const moduleIds = modules.map((m: any) => m.id);
    let lessonsByModule: Record<string, string[]> = {};
    let allLessonIds: string[] = [];

    if (moduleIds.length > 0) {
      const { data: lessons } = await supabase
        .from("course_lessons")
        .select("id, module_id")
        .in("module_id", moduleIds);

      (lessons || []).forEach((l: any) => {
        if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = [];
        lessonsByModule[l.module_id].push(l.id);
        allLessonIds.push(l.id);
      });
    }

    // Get progress for enrolled users
    let progressData: any[] = [];
    if (allLessonIds.length > 0) {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, user_id, completed")
        .in("lesson_id", allLessonIds)
        .eq("completed", true);
      progressData = data || [];
    }

    // Build course-to-lessons map
    const courseLessonIds: Record<string, string[]> = {};
    modules.forEach((m: any) => {
      if (!courseLessonIds[m.course_id]) courseLessonIds[m.course_id] = [];
      courseLessonIds[m.course_id].push(...(lessonsByModule[m.id] || []));
    });

    // Aggregate
    const metrics: CourseMetrics[] = myCourses.map((c: any) => {
      const cEnrollments = enrollments.filter((e: any) => e.course_id === c.id);
      const cReviews = reviews.filter((r: any) => r.course_id === c.id);
      const cCerts = certificates.filter((cert: any) => cert.course_id === c.id);
      const cLessonIds = courseLessonIds[c.id] || [];

      // Average progress per enrolled user
      let avgProgress = 0;
      if (cEnrollments.length > 0 && cLessonIds.length > 0) {
        const userProgress = cEnrollments.map((e: any) => {
          const completedLessons = progressData.filter(
            (p: any) => p.user_id === e.user_id && cLessonIds.includes(p.lesson_id)
          ).length;
          return (completedLessons / cLessonIds.length) * 100;
        });
        avgProgress = userProgress.reduce((a: number, b: number) => a + b, 0) / userProgress.length;
      }

      const avgRating = cReviews.length > 0
        ? cReviews.reduce((s: number, r: any) => s + r.rating, 0) / cReviews.length
        : 0;

      return {
        id: c.id,
        title: c.title,
        category: c.category || "",
        premium: c.premium || false,
        created_at: c.created_at,
        enrollments: cEnrollments.length,
        avgProgress: Math.round(avgProgress),
        avgRating,
        reviewCount: cReviews.length,
        lessonCount: cLessonIds.length,
        certificateCount: cCerts.length,
      };
    });

    setCourses(metrics);
    setLoading(false);
  };

  const totals = useMemo(() => ({
    courses: courses.length,
    students: courses.reduce((s, c) => s + c.enrollments, 0),
    avgProgress: courses.length > 0
      ? Math.round(courses.reduce((s, c) => s + c.avgProgress, 0) / courses.length)
      : 0,
    avgRating: courses.length > 0
      ? courses.filter(c => c.avgRating > 0).reduce((s, c) => s + c.avgRating, 0) /
        (courses.filter(c => c.avgRating > 0).length || 1)
      : 0,
    certificates: courses.reduce((s, c) => s + c.certificateCount, 0),
    reviews: courses.reduce((s, c) => s + c.reviewCount, 0),
  }), [courses]);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/95 backdrop-blur-md">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/academia")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Academia
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-foreground">Dashboard do Instrutor</h1>
            <p className="text-xs text-muted-foreground">Visão geral dos seus cursos e alunos</p>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-8 space-y-8">
        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Alunos Matriculados", value: totals.students, icon: Users, color: "text-primary" },
            { label: "Progresso Médio", value: `${totals.avgProgress}%`, icon: TrendingUp, color: "text-emerald-500" },
            { label: "Avaliação Média", value: totals.avgRating > 0 ? totals.avgRating.toFixed(1) : "—", icon: Star, color: "text-amber-500" },
            { label: "Cursos Publicados", value: totals.courses, icon: BookOpen, color: "text-primary" },
            { label: "Certificados Emitidos", value: totals.certificates, icon: Award, color: "text-primary" },
            { label: "Total de Avaliações", value: totals.reviews, icon: BarChart3, color: "text-muted-foreground" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Courses table */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-foreground">Seus Cursos</h2>

          {courses.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
              <GraduationCap className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="mb-1 font-semibold text-foreground">Nenhum curso criado</p>
              <p className="mb-4 text-sm text-muted-foreground">Crie seu primeiro curso na Academia.</p>
              <Button onClick={() => navigate("/academia")}>Ir para Academia</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Course info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground truncate">{course.title}</h3>
                        {course.premium && <Badge className="bg-accent text-accent-foreground text-[10px]">Premium</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{course.category}</span>
                        <span>{course.lessonCount} aulas</span>
                        <span>Criado em {new Date(course.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-bold text-foreground">{course.enrollments}</p>
                        <p className="text-[10px] text-muted-foreground">Alunos</p>
                      </div>

                      <div className="min-w-[80px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">Progresso</span>
                          <span className="text-xs font-bold text-foreground">{course.avgProgress}%</span>
                        </div>
                        <Progress value={course.avgProgress} className="h-1.5" />
                      </div>

                      <div className="flex items-center gap-1 min-w-[50px]">
                        <Star className={`h-4 w-4 ${course.avgRating > 0 ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                        <span className="text-sm font-bold text-foreground">
                          {course.avgRating > 0 ? course.avgRating.toFixed(1) : "—"}
                        </span>
                        {course.reviewCount > 0 && (
                          <span className="text-[10px] text-muted-foreground">({course.reviewCount})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 min-w-[40px]">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">{course.certificateCount}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/curso/${course.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/curso/${course.id}/gerenciar`)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
