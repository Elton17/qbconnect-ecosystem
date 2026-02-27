import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Loader2, Upload, Link as LinkIcon,
  Play, FileText, ChevronDown, ChevronRight, Pencil, Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Module {
  id: string;
  course_id: string;
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

export default function CourseManagePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Module form
  const [moduleDialog, setModuleDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [savingModule, setSavingModule] = useState(false);

  // Lesson form
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState("");
  const [lessonForm, setLessonForm] = useState({
    title: "", description: "", video_url: "", video_type: "youtube" as string,
    duration_seconds: 0, is_preview: false,
  });
  const [savingLesson, setSavingLesson] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [lessonMaterials, setLessonMaterials] = useState<any[]>([]);

  useEffect(() => { if (id) fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    const [cRes, mRes, lRes] = await Promise.all([
      supabase.from("courses").select("*").eq("id", id).single(),
      supabase.from("course_modules").select("*").eq("course_id", id).order("sort_order"),
      supabase.from("course_lessons").select("*").order("sort_order"),
    ]);

    if (cRes.data) {
      if (cRes.data.user_id !== user?.id) { navigate("/academia"); return; }
      setCourse(cRes.data);
    }

    const mods = (mRes.data || []) as any[];
    const lessons = (lRes.data || []) as any[];
    const built: Module[] = mods.map(m => ({
      ...m, lessons: lessons.filter(l => l.module_id === m.id).sort((a: any, b: any) => a.sort_order - b.sort_order)
    }));
    setModules(built);
    if (built.length > 0 && expandedModules.size === 0) setExpandedModules(new Set([built[0].id]));
    setLoading(false);
  };

  // Module CRUD
  const openModuleDialog = (mod?: Module) => {
    if (mod) { setEditingModule(mod); setModuleForm({ title: mod.title, description: mod.description }); }
    else { setEditingModule(null); setModuleForm({ title: "", description: "" }); }
    setModuleDialog(true);
  };

  const saveModule = async () => {
    if (!moduleForm.title.trim()) return;
    setSavingModule(true);
    if (editingModule) {
      await supabase.from("course_modules").update({ title: moduleForm.title, description: moduleForm.description }).eq("id", editingModule.id);
    } else {
      await supabase.from("course_modules").insert({
        course_id: id!, title: moduleForm.title, description: moduleForm.description,
        sort_order: modules.length,
      });
    }
    setSavingModule(false);
    setModuleDialog(false);
    fetchAll();
  };

  const deleteModule = async (modId: string) => {
    if (!confirm("Excluir módulo e todas as aulas?")) return;
    await supabase.from("course_modules").delete().eq("id", modId);
    fetchAll();
  };

  // Lesson CRUD
  const openLessonDialog = (moduleId: string, lesson?: Lesson) => {
    setLessonModuleId(moduleId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title, description: lesson.description, video_url: lesson.video_url,
        video_type: lesson.video_type, duration_seconds: lesson.duration_seconds, is_preview: lesson.is_preview,
      });
      setLessonMaterials(lesson.materials || []);
    } else {
      setEditingLesson(null);
      setLessonForm({ title: "", description: "", video_url: "", video_type: "youtube", duration_seconds: 0, is_preview: false });
      setLessonMaterials([]);
    }
    setLessonDialog(true);
  };

  const saveLesson = async () => {
    if (!lessonForm.title.trim()) return;
    setSavingLesson(true);
    const mod = modules.find(m => m.id === lessonModuleId);
    const payload = {
      ...lessonForm,
      materials: lessonMaterials,
      module_id: lessonModuleId,
      sort_order: editingLesson ? editingLesson.sort_order : (mod?.lessons.length || 0),
    };

    if (editingLesson) {
      await supabase.from("course_lessons").update(payload).eq("id", editingLesson.id);
    } else {
      await supabase.from("course_lessons").insert(payload);
    }
    setSavingLesson(false);
    setLessonDialog(false);
    fetchAll();
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm("Excluir esta aula?")) return;
    await supabase.from("course_lessons").delete().eq("id", lessonId);
    fetchAll();
  };

  // Video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingVideo(true);
    const path = `${user.id}/${id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("courses").upload(path, file);
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); setUploadingVideo(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("courses").getPublicUrl(path);
    setLessonForm(f => ({ ...f, video_url: publicUrl, video_type: "upload" }));
    setUploadingVideo(false);
    toast({ title: "Vídeo enviado!" });
  };

  // Material upload
  const handleMaterialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingMaterial(true);
    const path = `${user.id}/${id}/materials/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("courses").upload(path, file);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); setUploadingMaterial(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("courses").getPublicUrl(path);
    setLessonMaterials(prev => [...prev, { name: file.name, url: publicUrl, type: file.type }]);
    setUploadingMaterial(false);
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!course) return <div className="container py-20 text-center"><p className="text-muted-foreground">Curso não encontrado.</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="container flex items-center gap-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/curso/${id}`)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar ao Curso
          </Button>
          <h2 className="flex-1 truncate text-sm font-bold text-foreground">Gerenciar: {course.title}</h2>
        </div>
      </div>

      <div className="container max-w-3xl py-8 space-y-6">
        {/* Add module button */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">Módulos & Aulas</h3>
          <Button onClick={() => openModuleDialog()}><Plus className="mr-1 h-4 w-4" /> Novo Módulo</Button>
        </div>

        {modules.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
            <Play className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="mb-1 font-semibold text-foreground">Nenhum módulo criado</p>
            <p className="mb-4 text-sm text-muted-foreground">Comece adicionando o primeiro módulo do seu curso.</p>
            <Button onClick={() => openModuleDialog()}><Plus className="mr-1 h-4 w-4" /> Criar Módulo</Button>
          </div>
        )}

        {/* Modules list */}
        {modules.map((mod, mi) => (
          <motion.div key={mod.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/30">
              <GripVertical className="h-4 w-4 text-muted-foreground/40" />
              <button onClick={() => setExpandedModules(prev => {
                const n = new Set(prev); n.has(mod.id) ? n.delete(mod.id) : n.add(mod.id); return n;
              })}>
                {expandedModules.has(mod.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <div className="flex-1">
                <span className="text-xs text-muted-foreground">Módulo {mi + 1}</span>
                <p className="text-sm font-bold text-foreground">{mod.title}</p>
              </div>
              <span className="text-xs text-muted-foreground">{mod.lessons.length} aulas</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModuleDialog(mod)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteModule(mod.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <AnimatePresence>
              {expandedModules.has(mod.id) && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="divide-y divide-border">
                    {mod.lessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/20 transition-colors">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30" />
                        <Play className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {lesson.video_type && <span className="capitalize">{lesson.video_type}</span>}
                            {lesson.is_preview && <span className="text-primary">• Prévia</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openLessonDialog(mod.id, lesson)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteLesson(lesson.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border p-3">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => openLessonDialog(mod.id)}>
                      <Plus className="mr-1 h-4 w-4" /> Adicionar Aula
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Module Dialog */}
      <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingModule ? "Editar Módulo" : "Novo Módulo"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={moduleForm.title} onChange={e => setModuleForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Introdução ao Marketing" /></div>
            <div><Label>Descrição</Label><Textarea value={moduleForm.description} onChange={e => setModuleForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <Button onClick={saveModule} disabled={savingModule || !moduleForm.title.trim()} className="w-full">
              {savingModule ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              {editingModule ? "Salvar" : "Criar Módulo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingLesson ? "Editar Aula" : "Nova Aula"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} placeholder="Título da aula" /></div>
            <div><Label>Descrição</Label><Textarea value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>

            {/* Video source */}
            <div>
              <Label>Fonte do Vídeo</Label>
              <Select value={lessonForm.video_type} onValueChange={v => setLessonForm(f => ({ ...f, video_type: v, video_url: "" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                  <SelectItem value="upload">Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {lessonForm.video_type === "upload" ? (
              <div>
                <Label>Upload de Vídeo</Label>
                {lessonForm.video_url ? (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 text-sm">
                    <Play className="h-4 w-4 text-primary" />
                    <span className="flex-1 truncate text-muted-foreground">Vídeo enviado</span>
                    <Button variant="ghost" size="sm" onClick={() => setLessonForm(f => ({ ...f, video_url: "" }))}>Trocar</Button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 hover:border-primary/50 transition-colors">
                    {uploadingVideo ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <Upload className="h-8 w-8 text-muted-foreground/40" />}
                    <span className="text-sm text-muted-foreground">{uploadingVideo ? "Enviando..." : "Clique para fazer upload"}</span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo} />
                  </label>
                )}
              </div>
            ) : (
              <div>
                <Label>URL do Vídeo</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" value={lessonForm.video_url} onChange={e => setLessonForm(f => ({ ...f, video_url: e.target.value }))}
                    placeholder={lessonForm.video_type === "youtube" ? "https://youtube.com/watch?v=..." : "https://vimeo.com/..."} />
                </div>
              </div>
            )}

            <div>
              <Label>Duração (minutos)</Label>
              <Input type="number" value={Math.floor(lessonForm.duration_seconds / 60) || ""} onChange={e => setLessonForm(f => ({ ...f, duration_seconds: parseInt(e.target.value || "0") * 60 }))} placeholder="0" />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={lessonForm.is_preview} onCheckedChange={v => setLessonForm(f => ({ ...f, is_preview: v }))} />
              <Label>Aula prévia (gratuita)</Label>
            </div>

            {/* Materials */}
            <div>
              <Label>Materiais de Apoio</Label>
              {lessonMaterials.map((mat, i) => (
                <div key={i} className="mt-1 flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="flex-1 truncate">{mat.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLessonMaterials(prev => prev.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm hover:border-primary/50 transition-colors">
                {uploadingMaterial ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span className="text-muted-foreground">{uploadingMaterial ? "Enviando..." : "Adicionar material"}</span>
                <input type="file" className="hidden" onChange={handleMaterialUpload} disabled={uploadingMaterial} />
              </label>
            </div>

            <Button onClick={saveLesson} disabled={savingLesson || !lessonForm.title.trim()} className="w-full">
              {savingLesson ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              {editingLesson ? "Salvar Aula" : "Criar Aula"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
