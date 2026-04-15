import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  GraduationCap, BookOpen, Play, Clock, Award, Search,
  Loader2, ChevronRight, ArrowRight, CheckCircle2, Trophy
} from "lucide-react";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  premium: boolean;
  level: string;
  instructor_name: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lastAccessedAt: string | null;
  hasCertificate: boolean;
  enrolled_at: string;
}

export default function MeusCursosPage() {
  usePageTitle("Meus Cursos");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "inProgress" | "completed">("all");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("contact_name, company_name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile) setUserName(profile.contact_name || profile.company_name || "");

    // Fetch enrollments
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("course_id, enrolled_at")
      .eq("user_id", user.id);

    if (!enrollments || enrollments.length === 0) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map(e => e.course_id);
    const enrollMap = new Map(enrollments.map(e => [e.course_id, e.enrolled_at]));

    // Parallel fetch
    const [coursesRes, modulesRes, progressRes, certsRes] = await Promise.all([
      supabase.from("courses").select("*").in("id", courseIds),
      supabase.from("course_modules").select("id, course_id").in("course_id", courseIds),
      supabase.from("lesson_progress").select("lesson_id, completed, updated_at").eq("user_id", user.id),
      supabase.from("certificates").select("course_id, certificate_code, issued_at").eq("user_id", user.id),
    ]);

    const allCourses = coursesRes.data || [];
    const allModules = modulesRes.data || [];
    const allProgress = progressRes.data || [];
    const allCerts = certsRes.data || [];

    setCertificates(allCerts);

    // Get lessons for all modules
    const moduleIds = allModules.map(m => m.id);
    let lessonsByModule: Record<string, string[]> = {};
    if (moduleIds.length > 0) {
      const { data: lessons } = await supabase
        .from("course_lessons")
        .select("id, module_id")
        .in("module_id", moduleIds);
      (lessons || []).forEach((l: any) => {
        if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = [];
        lessonsByModule[l.module_id].push(l.id);
      });
    }

    // Map course -> lesson ids
    const courseLessonIds: Record<string, string[]> = {};
    allModules.forEach((m: any) => {
      if (!courseLessonIds[m.course_id]) courseLessonIds[m.course_id] = [];
      courseLessonIds[m.course_id].push(...(lessonsByModule[m.id] || []));
    });

    // Progress map
    const progressMap = new Map(allProgress.map(p => [p.lesson_id, p]));
    const certMap = new Map(allCerts.map(c => [c.course_id, true]));

    const enriched: EnrolledCourse[] = allCourses.map((c: any) => {
      const lessonIds = courseLessonIds[c.id] || [];
      const completed = lessonIds.filter(lid => progressMap.get(lid)?.completed).length;
      const percent = lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0;

      // Find last accessed lesson
      let lastAccessed: string | null = null;
      lessonIds.forEach(lid => {
        const p = progressMap.get(lid);
        if (p?.updated_at && (!lastAccessed || p.updated_at > lastAccessed)) {
          lastAccessed = p.updated_at;
        }
      });

      return {
        id: c.id,
        title: c.title,
        description: c.description || "",
        category: c.category || "",
        thumbnail_url: c.thumbnail_url || "",
        premium: c.premium || false,
        level: c.level || "iniciante",
        instructor_name: c.instructor_name || "",
        totalLessons: lessonIds.length,
        completedLessons: completed,
        progressPercent: percent,
        lastAccessedAt: lastAccessed,
        hasCertificate: !!certMap.get(c.id),
        enrolled_at: enrollMap.get(c.id) || "",
      };
    });

    // Sort: in-progress first (by last accessed), then not started, then completed
    enriched.sort((a, b) => {
      if (a.progressPercent === 100 && b.progressPercent !== 100) return 1;
      if (a.progressPercent !== 100 && b.progressPercent === 100) return -1;
      if (a.lastAccessedAt && b.lastAccessedAt) return b.lastAccessedAt.localeCompare(a.lastAccessedAt);
      if (a.lastAccessedAt) return -1;
      if (b.lastAccessedAt) return 1;
      return 0;
    });

    setCourses(enriched);
    setLoading(false);
  };

  const filtered = courses
    .filter(c => {
      if (filterTab === "inProgress") return c.progressPercent > 0 && c.progressPercent < 100;
      if (filterTab === "completed") return c.progressPercent === 100;
      return true;
    })
    .filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    });

  const inProgressCourses = courses.filter(c => c.progressPercent > 0 && c.progressPercent < 100);
  const completedCourses = courses.filter(c => c.progressPercent === 100);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-secondary py-10 md:py-14">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <h1 className="mb-2 text-3xl font-extrabold text-secondary-foreground md:text-4xl">
              {userName ? `Olá, ${userName.split(" ")[0]}! 👋` : "Meus Cursos"}
            </h1>
            <p className="text-secondary-foreground/70">
              Acompanhe seu progresso e continue aprendendo.
            </p>
          </motion.div>

          {/* Quick stats */}
          {courses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="mt-6 flex flex-wrap gap-3">
              {[
                { label: "Matriculados", value: courses.length, icon: BookOpen },
                { label: "Em andamento", value: inProgressCourses.length, icon: Play },
                { label: "Concluídos", value: completedCourses.length, icon: CheckCircle2 },
                { label: "Certificados", value: certificates.length, icon: Award },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-2.5 rounded-xl border border-secondary-foreground/10 bg-secondary-foreground/5 px-4 py-2.5 backdrop-blur-sm">
                  <stat.icon className="h-4 w-4 text-primary" />
                  <span className="text-lg font-extrabold text-secondary-foreground">{stat.value}</span>
                  <span className="text-xs text-secondary-foreground/60">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <div className="container py-8">
        {courses.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mx-auto max-w-md rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-bold text-foreground">Nenhum curso matriculado</h2>
            <p className="mb-6 text-muted-foreground">Explore a Escola de Negócios e inscreva-se em cursos gratuitos ou premium.</p>
            <Button size="lg" onClick={() => navigate("/academia")}>
              <BookOpen className="mr-2 h-4 w-4" /> Explorar Cursos
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Continue watching */}
            {inProgressCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                  <Play className="h-5 w-5 text-primary" /> Continuar Assistindo
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {inProgressCourses.slice(0, 3).map((course, i) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => navigate(`/curso/${course.id}`)}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="relative h-36 bg-secondary">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <GraduationCap className="h-10 w-10 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <Progress value={course.progressPercent} className="h-1.5 bg-white/20" />
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[11px] font-medium text-white/90">{course.progressPercent}% concluído</span>
                            <span className="text-[11px] text-white/70">{course.completedLessons}/{course.totalLessons}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="mb-1 font-bold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                        <Button size="sm" className="mt-3 w-full" variant="default">
                          <Play className="mr-1 h-3.5 w-3.5" /> Continuar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                {([
                  { key: "all" as const, label: "Todos", count: courses.length },
                  { key: "inProgress" as const, label: "Em andamento", count: inProgressCourses.length },
                  { key: "completed" as const, label: "Concluídos", count: completedCourses.length },
                ]).map(tab => (
                  <Button
                    key={tab.key}
                    variant={filterTab === tab.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterTab(tab.key)}
                  >
                    {tab.label} ({tab.count})
                  </Button>
                ))}
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar cursos..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Course list */}
            <div className="space-y-3">
              {filtered.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/curso/${course.id}`)}
                  className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:bg-muted/30 hover:shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary sm:block">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-card-foreground truncate group-hover:text-primary transition-colors">{course.title}</h3>
                      {course.premium && <Badge className="bg-accent text-accent-foreground text-[10px]">Premium</Badge>}
                      {course.hasCertificate && <Trophy className="h-4 w-4 text-accent" />}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{course.category}</span>
                      {course.instructor_name && <span>• {course.instructor_name}</span>}
                      <span>• {course.completedLessons}/{course.totalLessons} aulas</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="hidden w-32 shrink-0 sm:block">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Progresso</span>
                      <span className="text-xs font-bold text-foreground">{course.progressPercent}%</span>
                    </div>
                    <Progress value={course.progressPercent} className="h-1.5" />
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </motion.div>
              ))}

              {filtered.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">Nenhum curso encontrado.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
