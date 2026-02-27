import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Play, Lock, CheckCircle2, ChevronDown, ChevronRight, Clock, Users, Star,
  BookOpen, Award, ArrowLeft, Loader2, Download, FileText, MessageSquare
} from "lucide-react";
import CertificateGenerator from "@/components/courses/CertificateGenerator";

interface Module {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string;
  video_type: string;
  duration_seconds: number;
  sort_order: number;
  is_preview: boolean;
  materials: any[];
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profile_name?: string;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [userName, setUserName] = useState("");

  const allLessons = useMemo(() => modules.flatMap(m => m.lessons), [modules]);
  const completedCount = useMemo(() => Object.values(progress).filter(Boolean).length, [progress]);
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  useEffect(() => {
    if (id) fetchAll();
  }, [id, user]);

  const fetchAll = async () => {
    setLoading(true);
    const [courseRes, modulesRes, lessonsRes, reviewsRes] = await Promise.all([
      supabase.from("courses").select("*").eq("id", id).single(),
      supabase.from("course_modules").select("*").eq("course_id", id).order("sort_order"),
      supabase.from("course_lessons").select("*").order("sort_order"),
      supabase.from("course_reviews").select("*").eq("course_id", id).order("created_at", { ascending: false }),
    ]);

    if (courseRes.data) setCourse(courseRes.data);

    const mods = (modulesRes.data || []) as any[];
    const allL = (lessonsRes.data || []) as any[];
    const built: Module[] = mods.map(m => ({
      ...m,
      lessons: allL.filter(l => l.module_id === m.id).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }));
    setModules(built);

    if (built.length > 0) {
      setExpandedModules(new Set([built[0].id]));
      if (built[0].lessons.length > 0) setActiveLesson(built[0].lessons[0]);
    }

    // Get reviewer names
    const reviewData = (reviewsRes.data || []) as any[];
    if (reviewData.length > 0) {
      const uids = [...new Set(reviewData.map((r: any) => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, company_name").in("user_id", uids);
      const pMap = new Map((profiles || []).map((p: any) => [p.user_id, p.company_name]));
      setReviews(reviewData.map((r: any) => ({ ...r, profile_name: pMap.get(r.user_id) || "Anônimo" })));
    }

    if (user) {
      const [enrRes, progRes, profileRes] = await Promise.all([
        supabase.from("course_enrollments").select("*").eq("course_id", id).eq("user_id", user.id).maybeSingle(),
        supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id),
        supabase.from("profiles").select("company_name, contact_name").eq("user_id", user.id).maybeSingle(),
      ]);
      setEnrollment(enrRes.data);
      if (profileRes.data) {
        setUserName(profileRes.data.contact_name || profileRes.data.company_name || "Aluno");
      }
      if (progRes.data) {
        const map: Record<string, boolean> = {};
        progRes.data.forEach((p: any) => { map[p.lesson_id] = p.completed; });
        setProgress(map);
      }
    }
    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!user) { navigate("/login"); return; }
    setEnrolling(true);
    const { error } = await supabase.from("course_enrollments").insert({ course_id: id, user_id: user.id });
    setEnrolling(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Inscrição realizada!" });
    fetchAll();
  };

  const toggleComplete = async (lessonId: string) => {
    if (!user) return;
    const isCompleted = !progress[lessonId];
    setProgress(prev => ({ ...prev, [lessonId]: isCompleted }));

    const { error } = await supabase.from("lesson_progress").upsert({
      lesson_id: lessonId,
      user_id: user.id,
      completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    }, { onConflict: "lesson_id,user_id" });

    if (error) setProgress(prev => ({ ...prev, [lessonId]: !isCompleted }));
  };

  const submitReview = async () => {
    if (!user) return;
    setSubmittingReview(true);
    const { error } = await supabase.from("course_reviews").upsert({
      course_id: id,
      user_id: user.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    }, { onConflict: "course_id,user_id" });
    setSubmittingReview(false);
    if (!error) {
      toast({ title: "Avaliação enviada!" });
      setReviewForm({ rating: 5, comment: "" });
      fetchAll();
    }
  };

  const canWatch = (lesson: Lesson) => lesson.is_preview || !!enrollment || course?.user_id === user?.id;
  const isOwner = course?.user_id === user?.id;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const formatDuration = (s: number) => {
    if (!s) return "";
    const m = Math.floor(s / 60);
    return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? `${m % 60}min` : ""}` : `${m}min`;
  };

  const totalDuration = allLessons.reduce((s, l) => s + (l.duration_seconds || 0), 0);

  const renderVideo = (lesson: Lesson) => {
    if (!lesson.video_url) return (
      <div className="flex aspect-video items-center justify-center bg-secondary rounded-xl">
        <Play className="h-16 w-16 text-muted-foreground/30" />
      </div>
    );

    if (lesson.video_type === "youtube") {
      const vid = lesson.video_url.match(/(?:youtu\.be\/|v=)([^&]+)/)?.[1];
      return <iframe className="aspect-video w-full rounded-xl" src={`https://www.youtube.com/embed/${vid}`} allowFullScreen />;
    }
    if (lesson.video_type === "vimeo") {
      const vid = lesson.video_url.match(/vimeo\.com\/(\d+)/)?.[1];
      return <iframe className="aspect-video w-full rounded-xl" src={`https://player.vimeo.com/video/${vid}`} allowFullScreen />;
    }
    return <video className="aspect-video w-full rounded-xl bg-secondary" src={lesson.video_url} controls />;
  };

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!course) return (
    <div className="container py-20 text-center">
      <p className="text-muted-foreground">Curso não encontrado.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="container flex items-center gap-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/academia")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          <div className="flex-1 truncate">
            <h2 className="truncate text-sm font-bold text-foreground">{course.title}</h2>
          </div>
          {enrollment && (
            <div className="hidden items-center gap-3 sm:flex">
              <Progress value={progressPercent} className="w-32" />
              <span className="text-xs font-medium text-muted-foreground">{progressPercent}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="container py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Video player */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-xl border border-border bg-card">
              {activeLesson && canWatch(activeLesson) ? (
                <div>
                  {renderVideo(activeLesson)}
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">{activeLesson.title}</h3>
                      {enrollment && (
                        <Button
                          variant={progress[activeLesson.id] ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleComplete(activeLesson.id)}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          {progress[activeLesson.id] ? "Concluída" : "Marcar concluída"}
                        </Button>
                      )}
                    </div>
                    {activeLesson.description && (
                      <p className="text-sm text-muted-foreground">{activeLesson.description}</p>
                    )}
                    {/* Materials */}
                    {activeLesson.materials && (activeLesson.materials as any[]).length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="flex items-center gap-1 text-sm font-semibold text-foreground">
                          <FileText className="h-4 w-4" /> Materiais de Apoio
                        </h4>
                        {(activeLesson.materials as any[]).map((mat: any, i: number) => (
                          <a key={i} href={mat.url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm hover:bg-muted transition-colors">
                            <Download className="h-4 w-4 text-primary" />
                            <span>{mat.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : activeLesson ? (
                <div className="flex aspect-video flex-col items-center justify-center bg-secondary/50 p-8 text-center">
                  <Lock className="mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="mb-1 font-semibold text-foreground">Conteúdo exclusivo</p>
                  <p className="mb-4 text-sm text-muted-foreground">Inscreva-se no curso para assistir esta aula.</p>
                  <Button onClick={handleEnroll} disabled={enrolling}>
                    {enrolling ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                    Inscrever-se {course.premium ? "• Premium" : "• Gratuito"}
                  </Button>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-secondary">
                  <BookOpen className="h-16 w-16 text-muted-foreground/20" />
                </div>
              )}
            </motion.div>

            {/* Course info (when not enrolled yet) */}
            {!enrollment && !isOwner && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                    <h1 className="text-2xl font-extrabold text-foreground">{course.title}</h1>
                  </div>
                  <Button size="lg" onClick={handleEnroll} disabled={enrolling} className="shrink-0">
                    {enrolling ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Play className="mr-1 h-4 w-4" />}
                    {course.premium ? "Inscrever-se • Premium" : "Inscrever-se Grátis"}
                  </Button>
                </div>
                {course.description && <p className="text-muted-foreground">{course.description}</p>}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {allLessons.length} aulas</span>
                  {totalDuration > 0 && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDuration(totalDuration)}</span>}
                  {avgRating && <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /> {avgRating}</span>}
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {modules.length} módulos</span>
                </div>
              </motion.div>
            )}

            {/* Reviews section */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <MessageSquare className="h-5 w-5" /> Avaliações
                {avgRating && (
                  <span className="ml-auto flex items-center gap-1 text-sm font-normal text-muted-foreground">
                    <Star className="h-4 w-4 fill-accent text-accent" /> {avgRating} ({reviews.length})
                  </span>
                )}
              </h3>

              {enrollment && user && (
                <div className="mb-6 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                        <Star className={`h-5 w-5 transition-colors ${s <= reviewForm.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="Deixe seu comentário..." rows={2} />
                  <Button size="sm" onClick={submitReview} disabled={submittingReview}>
                    {submittingReview ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null} Enviar Avaliação
                  </Button>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 10).map(r => (
                    <div key={r.id} className="rounded-lg border border-border p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{r.profile_name}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-accent text-accent" : "text-muted-foreground/20"}`} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - curriculum */}
          <div className="space-y-4">
            {enrollment && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">Seu progresso</span>
                  <span className="text-muted-foreground">{completedCount}/{allLessons.length}</span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
                {progressPercent === 100 && user && (
                  <CertificateGenerator
                    courseId={id!}
                    courseTitle={course.title}
                    userId={user.id}
                    userName={userName}
                  />
                )}
              </div>
            )}

            <div className="rounded-xl border border-border bg-card">
              <h3 className="border-b border-border px-4 py-3 text-sm font-bold text-foreground">
                Conteúdo do Curso
              </h3>
              <div className="divide-y divide-border">
                {modules.map((mod, mi) => (
                  <div key={mod.id}>
                    <button
                      onClick={() => setExpandedModules(prev => {
                        const n = new Set(prev);
                        n.has(mod.id) ? n.delete(mod.id) : n.add(mod.id);
                        return n;
                      })}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      {expandedModules.has(mod.id) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground">Módulo {mi + 1}</span>
                        <p className="text-sm font-semibold text-foreground">{mod.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{mod.lessons.length} aulas</span>
                    </button>
                    <AnimatePresence>
                      {expandedModules.has(mod.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {mod.lessons.map((lesson) => {
                            const isActive = activeLesson?.id === lesson.id;
                            const isComplete = progress[lesson.id];
                            const locked = !canWatch(lesson);
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => !locked && setActiveLesson(lesson)}
                                className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors ${
                                  isActive ? "bg-primary/10 text-primary" : locked ? "text-muted-foreground/50" : "hover:bg-muted/30 text-foreground"
                                }`}
                              >
                                {isComplete ? (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                ) : locked ? (
                                  <Lock className="h-4 w-4 shrink-0" />
                                ) : (
                                  <Play className="h-4 w-4 shrink-0" />
                                )}
                                <span className="flex-1 truncate">{lesson.title}</span>
                                {lesson.is_preview && !enrollment && (
                                  <Badge variant="outline" className="text-[10px] px-1.5">Prévia</Badge>
                                )}
                                {lesson.duration_seconds > 0 && (
                                  <span className="text-xs text-muted-foreground">{formatDuration(lesson.duration_seconds)}</span>
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {modules.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground">Nenhum conteúdo adicionado ainda.</p>
                )}
              </div>
            </div>

            {isOwner && (
              <Button className="w-full" onClick={() => navigate(`/curso/${id}/gerenciar`)}>
                Gerenciar Conteúdo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
