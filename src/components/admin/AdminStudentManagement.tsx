import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users, Search, Loader2, Eye, Trash2, GraduationCap,
  UserPlus, BookOpen, Award, ChevronRight, Download
} from "lucide-react";

interface StudentRow {
  user_id: string;
  email: string;
  company_name: string;
  contact_name: string;
  enrollments: { course_id: string; course_title: string; progress: number; enrolled_at: string }[];
  certificateCount: number;
}

export default function AdminStudentManagement() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailStudent, setDetailStudent] = useState<StudentRow | null>(null);
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [enrollUserId, setEnrollUserId] = useState("");
  const [enrollCourseId, setEnrollCourseId] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  async function fetchStudents() {
    setLoading(true);

    const [enrollRes, coursesRes, profilesRes, certsRes, modulesRes] = await Promise.all([
      supabase.from("course_enrollments").select("*"),
      supabase.from("courses").select("id, title").order("title"),
      supabase.from("profiles").select("user_id, email, company_name, contact_name"),
      supabase.from("certificates").select("user_id, course_id"),
      supabase.from("course_modules").select("id, course_id"),
    ]);

    const enrollments = enrollRes.data || [];
    const allCourses = coursesRes.data || [];
    const profiles = profilesRes.data || [];
    const certs = certsRes.data || [];
    const modules = modulesRes.data || [];

    setCourses(allCourses);

    // Get lesson IDs per course
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

    // Get all progress
    const allLessonIds = Object.values(courseLessonIds).flat();
    let progressMap: Record<string, Set<string>> = {};
    if (allLessonIds.length > 0) {
      const { data: prog } = await supabase.from("lesson_progress").select("user_id, lesson_id").eq("completed", true);
      (prog || []).forEach((p: any) => {
        if (!progressMap[p.user_id]) progressMap[p.user_id] = new Set();
        progressMap[p.user_id].add(p.lesson_id);
      });
    }

    // Build student rows
    const courseMap = new Map(allCourses.map((c: any) => [c.id, c.title]));
    const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]));
    const certsByUser: Record<string, number> = {};
    certs.forEach((c: any) => { certsByUser[c.user_id] = (certsByUser[c.user_id] || 0) + 1; });

    // Group enrollments by user
    const userEnrollments: Record<string, any[]> = {};
    enrollments.forEach((e: any) => {
      if (!userEnrollments[e.user_id]) userEnrollments[e.user_id] = [];
      userEnrollments[e.user_id].push(e);
    });

    const rows: StudentRow[] = Object.entries(userEnrollments).map(([userId, enrs]) => {
      const profile = profileMap.get(userId);
      const userCompleted = progressMap[userId] || new Set();

      return {
        user_id: userId,
        email: profile?.email || "",
        company_name: profile?.company_name || "",
        contact_name: profile?.contact_name || "",
        certificateCount: certsByUser[userId] || 0,
        enrollments: enrs.map((e: any) => {
          const lessonIds = courseLessonIds[e.course_id] || [];
          const completed = lessonIds.filter((lid) => userCompleted.has(lid)).length;
          const progress = lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0;
          return {
            course_id: e.course_id,
            course_title: courseMap.get(e.course_id) || "Curso removido",
            progress,
            enrolled_at: e.enrolled_at,
          };
        }),
      };
    });

    rows.sort((a, b) => b.enrollments.length - a.enrollments.length);
    setStudents(rows);
    setLoading(false);
  }

  async function handleEnroll() {
    if (!enrollUserId || !enrollCourseId) return;
    setEnrolling(true);
    const { error } = await supabase.from("course_enrollments").insert({
      user_id: enrollUserId,
      course_id: enrollCourseId,
    });
    setEnrolling(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Aluno já matriculado neste curso" : error.message);
      return;
    }
    toast.success("Aluno matriculado!");
    setEnrollDialog(false);
    setEnrollUserId("");
    setEnrollCourseId("");
    fetchStudents();
  }

  async function removeEnrollment(userId: string, courseId: string) {
    if (!confirm("Remover matrícula deste aluno neste curso?")) return;
    const { error } = await supabase.from("course_enrollments").delete()
      .eq("user_id", userId).eq("course_id", courseId);
    if (error) { toast.error(error.message); return; }
    toast.success("Matrícula removida");
    fetchStudents();
    if (detailStudent?.user_id === userId) {
      setDetailStudent((prev) => prev ? {
        ...prev,
        enrollments: prev.enrollments.filter((e) => e.course_id !== courseId),
      } : null);
    }
  }

  function exportCSV() {
    const headers = "Aluno,Empresa,Email,Cursos Matriculados,Certificados\n";
    const rows = students.map((s) =>
      `"${s.contact_name}","${s.company_name}","${s.email}",${s.enrollments.length},${s.certificateCount}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "alunos-qbcamp.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  }

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.contact_name.toLowerCase().includes(q) ||
      s.company_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);
  });

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Gestão de Alunos
          <Badge variant="secondary">{students.length} alunos</Badge>
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="mr-1 h-3.5 w-3.5" /> Exportar
          </Button>
          <Button size="sm" onClick={() => setEnrollDialog(true)}>
            <UserPlus className="mr-1 h-3.5 w-3.5" /> Matricular Aluno
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar aluno..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhum aluno encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Aluno</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Empresa</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Cursos</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Certificados</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.user_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-card-foreground">{s.contact_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </td>
                  <td className="px-4 py-3 text-card-foreground">{s.company_name || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="secondary">{s.enrollments.length}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.certificateCount > 0 ? (
                      <Badge className="bg-accent text-accent-foreground">{s.certificateCount}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => setDetailStudent(s)}>
                        <Eye className="mr-1 h-3 w-3" /> Detalhes
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student detail dialog */}
      <Dialog open={!!detailStudent} onOpenChange={(o) => !o && setDetailStudent(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" /> Progresso do Aluno
            </DialogTitle>
          </DialogHeader>
          {detailStudent && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <p className="font-bold text-foreground">{detailStudent.contact_name || "Sem nome"}</p>
                <p className="text-sm text-muted-foreground">{detailStudent.company_name}</p>
                <p className="text-xs text-muted-foreground">{detailStudent.email}</p>
              </div>

              <div className="flex gap-4 text-center">
                <div className="flex-1 rounded-lg border border-border p-3">
                  <BookOpen className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xl font-bold text-foreground">{detailStudent.enrollments.length}</p>
                  <p className="text-[10px] text-muted-foreground">Cursos</p>
                </div>
                <div className="flex-1 rounded-lg border border-border p-3">
                  <Award className="mx-auto mb-1 h-5 w-5 text-accent" />
                  <p className="text-xl font-bold text-foreground">{detailStudent.certificateCount}</p>
                  <p className="text-[10px] text-muted-foreground">Certificados</p>
                </div>
              </div>

              <h4 className="text-sm font-bold text-foreground">Cursos Matriculados</h4>
              <div className="space-y-2">
                {detailStudent.enrollments.map((e) => (
                  <div key={e.course_id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{e.course_title}</p>
                      <Button size="sm" variant="destructive" className="h-7 text-[10px]"
                        onClick={() => removeEnrollment(detailStudent.user_id, e.course_id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={e.progress} className="flex-1 h-2" />
                      <span className="text-xs font-bold text-foreground">{e.progress}%</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Matriculado em {new Date(e.enrolled_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enroll dialog */}
      <Dialog open={enrollDialog} onOpenChange={setEnrollDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Matricular Aluno em Curso</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Aluno</label>
              <Select value={enrollUserId} onValueChange={setEnrollUserId}>
                <SelectTrigger><SelectValue placeholder="Selecione o aluno" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.user_id} value={s.user_id}>
                      {s.contact_name || s.email} — {s.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Curso</label>
              <Select value={enrollCourseId} onValueChange={setEnrollCourseId}>
                <SelectTrigger><SelectValue placeholder="Selecione o curso" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEnroll} disabled={enrolling || !enrollUserId || !enrollCourseId} className="w-full">
              {enrolling && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Matricular
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
