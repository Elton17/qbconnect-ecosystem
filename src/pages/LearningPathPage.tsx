import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, BookOpen, Clock, Users, Star, Play, CheckCircle2,
  GraduationCap, Loader2, Award, ArrowRight, Lock,
} from "lucide-react";

interface CourseInPath {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  premium: boolean;
  thumbnail_url: string;
  level: string;
  instructor_name: string;
  sort_order: number;
  module_count: number;
  lesson_count: number;
  enrollment_count: number;
  avg_rating: number;
  user_completed: boolean;
  user_progress: number;
}

const levelColors: Record<string, string> = {
  iniciante: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  intermediário: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  avançado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function LearningPathPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [path, setPath] = useState<any>(null);
  const [courses, setCourses] = useState<CourseInPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id, user]);

  const fetchData = async () => {
    setLoading(true);

    const [pathRes, junctionRes] = await Promise.all([
      supabase.from("learning_paths").select("*").eq("id", id).single(),
      supabase.from("learning_path_courses").select("course_id, sort_order").eq("learning_path_id", id!).order("sort_order"),
    ]);

    if (!pathRes.data) { setLoading(false); return; }
    setPath(pathRes.data);

    const courseIds = (junctionRes.data || []).map((j: any) => j.course_id);
    if (courseIds.length === 0) { setCourses([]); setLoading(false); return; }

    const sortMap = new Map((junctionRes.data || []).map((j: any) => [j.course_id, j.sort_order]));

    const { data: coursesData } = await supabase.from("courses").select("*").in("id", courseIds).eq("active", true);
    if (!coursesData) { setCourses([]); setLoading(false); return; }

    // Fetch aggregates
    const [modulesRes, enrollRes, reviewsRes] = await Promise.all([
      supabase.from("course_modules").select("id, course_id").in("course_id", courseIds),
      supabase.from("course_enrollments").select("course_id").in("course_id", courseIds),
      supabase.from("course_reviews").select("course_id, rating").in("course_id", courseIds),
    ]);

    const moduleIds = (modulesRes.data || []).map((m: any) => m.id);
    let lessonCounts: Record<string, number> = {};
    let userProgress: Record<string, { total: number; completed: number }> = {};

    if (moduleIds.length > 0) {
      const { data: lessons } = await supabase.from("course_lessons").select("id, module_id").in("module_id", moduleIds);
      const modToCourse: Record<string, string> = {};
      (modulesRes.data || []).forEach((m: any) => { modToCourse[m.id] = m.course_id; });
      (lessons || []).forEach((l: any) => {
        const cid = modToCourse[l.module_id];
        if (cid) {
          lessonCounts[cid] = (lessonCounts[cid] || 0) + 1;
          if (!userProgress[cid]) userProgress[cid] = { total: 0, completed: 0 };
          userProgress[cid].total++;
        }
      });

      if (user) {
        const lessonIds = (lessons || []).map((l: any) => l.id);
        const { data: prog } = await supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id).in("lesson_id", lessonIds);
        (prog || []).forEach((p: any) => {
          if (p.completed) {
            const lesson = (lessons || []).find((l: any) => l.id === p.lesson_id);
            if (lesson) {
              const cid = modToCourse[lesson.module_id];
              if (cid && userProgress[cid]) userProgress[cid].completed++;
            }
          }
        });
      }
    }

    const moduleCounts: Record<string, number> = {};
    (modulesRes.data || []).forEach((m: any) => { moduleCounts[m.course_id] = (moduleCounts[m.course_id] || 0) + 1; });

    const enrollCounts: Record<string, number> = {};
    (enrollRes.data || []).forEach((e: any) => { enrollCounts[e.course_id] = (enrollCounts[e.course_id] || 0) + 1; });

    const ratingMap: Record<string, { sum: number; count: number }> = {};
    (reviewsRes.data || []).forEach((r: any) => {
      if (!ratingMap[r.course_id]) ratingMap[r.course_id] = { sum: 0, count: 0 };
      ratingMap[r.course_id].sum += r.rating;
      ratingMap[r.course_id].count++;
    });

    const mapped: CourseInPath[] = coursesData.map((c: any) => {
      const prog = userProgress[c.id];
      const progPercent = prog && prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
      return {
        id: c.id,
        title: c.title,
        description: c.description || "",
        category: c.category || "",
        duration: c.duration || "",
        premium: c.premium,
        thumbnail_url: c.thumbnail_url || "",
        level: c.level || "iniciante",
        instructor_name: c.instructor_name || "",
        sort_order: sortMap.get(c.id) || 0,
        module_count: moduleCounts[c.id] || 0,
        lesson_count: lessonCounts[c.id] || 0,
        enrollment_count: enrollCounts[c.id] || 0,
        avg_rating: ratingMap[c.id] ? ratingMap[c.id].sum / ratingMap[c.id].count : 0,
        user_completed: progPercent === 100,
        user_progress: progPercent,
      };
    }).sort((a, b) => a.sort_order - b.sort_order);

    setCourses(mapped);
    setLoading(false);
  };

  const pathProgress = useMemo(() => {
    if (courses.length === 0) return 0;
    return Math.round(courses.reduce((s, c) => s + c.user_progress, 0) / courses.length);
  }, [courses]);

  const completedCourses = courses.filter(c => c.user_completed).length;

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!path) return (
    <div className="container py-20 text-center">
      <p className="text-muted-foreground">Trilha não encontrada.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-12 md:py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 -top-10 h-80 w-80 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="container relative">
          <Button variant="ghost" size="sm" onClick={() => navigate("/academia")} className="mb-4">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Academia
          </Button>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-3">Trilha de Aprendizado</Badge>
              <h1 className="mb-3 text-3xl font-extrabold text-secondary-foreground md:text-4xl">{path.title}</h1>
              {path.description && <p className="text-lg text-secondary-foreground/70">{path.description}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-secondary-foreground/60">
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {courses.length} cursos</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {courses.reduce((s, c) => s + (parseInt(c.duration) || 0), 0)}h estimadas</span>
              </div>
            </div>

            {user && (
              <div className="shrink-0 rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-5 backdrop-blur-sm min-w-[240px]">
                <div className="mb-2 flex items-center justify-between text-sm text-secondary-foreground">
                  <span className="font-semibold">Seu progresso</span>
                  <span>{completedCourses}/{courses.length} cursos</span>
                </div>
                <Progress value={pathProgress} className="h-3 mb-2" />
                <span className="text-xs text-secondary-foreground/60">{pathProgress}% concluído</span>
                {pathProgress === 100 && (
                  <div className="mt-3 flex items-center gap-2 text-accent">
                    <Award className="h-5 w-5" />
                    <span className="text-sm font-bold">Trilha concluída! 🎉</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Course list */}
      <div className="container py-8">
        <div className="space-y-4">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/curso/${course.id}`)}
              className="group flex cursor-pointer gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Number */}
              <div className="flex shrink-0 items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  course.user_completed
                    ? "bg-green-500 text-white"
                    : course.user_progress > 0
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {course.user_completed ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="hidden sm:block shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-secondary">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-card-foreground">{course.title}</h3>
                  <Badge className={`text-[10px] ${levelColors[course.level] || ""}`}>{course.level}</Badge>
                  {course.premium && <Badge className="bg-accent text-accent-foreground text-[10px]">Premium</Badge>}
                </div>
                {course.description && <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {course.instructor_name && <span>👨‍🏫 {course.instructor_name}</span>}
                  {course.lesson_count > 0 && <span>{course.lesson_count} aulas</span>}
                  {course.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>}
                  {course.avg_rating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-accent text-accent" />{course.avg_rating.toFixed(1)}</span>}
                  {course.enrollment_count > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrollment_count}</span>}
                </div>
              </div>

              {/* Progress / Arrow */}
              <div className="flex shrink-0 items-center gap-3">
                {course.user_progress > 0 && !course.user_completed && (
                  <div className="hidden sm:flex items-center gap-2">
                    <Progress value={course.user_progress} className="w-20 h-2" />
                    <span className="text-xs text-muted-foreground">{course.user_progress}%</span>
                  </div>
                )}
                <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum curso nesta trilha ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
