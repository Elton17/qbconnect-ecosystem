import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Play, Clock, Plus, Loader2, Trash2, BookOpen, Users, Award, Star, ArrowRight, BarChart3, Upload, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useApprovedCompany } from "@/hooks/useApprovedCompany";

const courseCategories = ["Marketing", "Finanças", "Gestão", "Vendas", "Jurídico", "Tecnologia", "RH", "Outro"];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface Course {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  premium: boolean;
  created_at: string;
  thumbnail_url?: string;
  company_name?: string;
  module_count?: number;
  lesson_count?: number;
  avg_rating?: number;
  enrollment_count?: number;
}

export default function AcademyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { approved } = useApprovedCompany();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Marketing", duration: "", premium: false, description: "" });
  const [filter, setFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const fetchData = async () => {
    const { data: items } = await supabase.from("courses").select("*").eq("active", true).order("created_at", { ascending: false });
    if (!items) { setLoading(false); return; }

    const ids = items.map((c: any) => c.id);
    const userIds = [...new Set(items.map((c: any) => c.user_id))];

    const [profilesRes, modulesRes, reviewsRes, enrollRes] = await Promise.all([
      supabase.from("profiles").select("user_id, company_name").in("user_id", userIds),
      supabase.from("course_modules").select("id, course_id").in("course_id", ids),
      supabase.from("course_reviews").select("course_id, rating").in("course_id", ids),
      supabase.from("course_enrollments").select("course_id").in("course_id", ids),
    ]);

    const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.user_id, p.company_name]));
    const moduleIds = (modulesRes.data || []).map((m: any) => m.id);

    // Get lesson count per module
    let lessonCounts: Record<string, number> = {};
    if (moduleIds.length > 0) {
      const { data: lessons } = await supabase.from("course_lessons").select("module_id").in("module_id", moduleIds);
      const moduleToCoursMap: Record<string, string> = {};
      (modulesRes.data || []).forEach((m: any) => { moduleToCoursMap[m.id] = m.course_id; });
      (lessons || []).forEach((l: any) => {
        const cid = moduleToCoursMap[l.module_id];
        if (cid) lessonCounts[cid] = (lessonCounts[cid] || 0) + 1;
      });
    }

    const moduleCounts: Record<string, number> = {};
    (modulesRes.data || []).forEach((m: any) => { moduleCounts[m.course_id] = (moduleCounts[m.course_id] || 0) + 1; });

    const ratingMap: Record<string, { sum: number; count: number }> = {};
    (reviewsRes.data || []).forEach((r: any) => {
      if (!ratingMap[r.course_id]) ratingMap[r.course_id] = { sum: 0, count: 0 };
      ratingMap[r.course_id].sum += r.rating;
      ratingMap[r.course_id].count++;
    });

    const enrollCounts: Record<string, number> = {};
    (enrollRes.data || []).forEach((e: any) => { enrollCounts[e.course_id] = (enrollCounts[e.course_id] || 0) + 1; });

    setCourses(items.map((c: any) => ({
      ...c,
      company_name: profileMap.get(c.user_id) || "QBCAMP Academy",
      module_count: moduleCounts[c.id] || 0,
      lesson_count: lessonCounts[c.id] || 0,
      avg_rating: ratingMap[c.id] ? ratingMap[c.id].sum / ratingMap[c.id].count : 0,
      enrollment_count: enrollCounts[c.id] || 0,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);

    let thumbnail_url = "";
    if (thumbnailFile) {
      setUploadingThumb(true);
      const path = `${user.id}/thumbnails/${Date.now()}-${thumbnailFile.name}`;
      const { error: upErr } = await supabase.storage.from("courses").upload(path, thumbnailFile);
      if (upErr) { toast({ title: "Erro no upload", description: upErr.message, variant: "destructive" }); setSaving(false); setUploadingThumb(false); return; }
      thumbnail_url = supabase.storage.from("courses").getPublicUrl(path).data.publicUrl;
      setUploadingThumb(false);
    }

    const { data, error } = await supabase.from("courses").insert({
      user_id: user.id, title: form.title, category: form.category, duration: form.duration, premium: form.premium, description: form.description, thumbnail_url,
    }).select().single();
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Curso criado!" });
      setForm({ title: "", category: "Marketing", duration: "", premium: false, description: "" });
      setThumbnailFile(null); setThumbnailPreview(null);
      setDialogOpen(false);
      if (data) navigate(`/curso/${data.id}/gerenciar`);
      else fetchData();
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await supabase.from("courses").delete().eq("id", id);
    fetchData();
  };

  const filteredCourses = (filter === "Todos" ? courses : filter === "Premium" ? courses.filter(c => c.premium) : courses.filter(c => c.category === filter))
    .filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.company_name?.toLowerCase().includes(q);
    });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-16 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 -top-10 h-80 w-80 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-20 right-10 h-60 w-60 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <GraduationCap className="h-4 w-4" /> Plataforma de Cursos
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl">
              Academia <span className="text-gradient">QBCAMP</span>
            </h1>
            <p className="mb-8 text-lg text-secondary-foreground/70">
              Cursos completos com vídeos, módulos e certificados. Aprenda com as melhores empresas da região.
            </p>
            {user && approved && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="xl"><Plus className="mr-1 h-5 w-5" /> Criar Curso</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Novo Curso</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome do curso" /></div>
                      <div><Label>Categoria *</Label>
                        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{courseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Duração estimada</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Ex: 4h" /></div>
                      <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                      <div>
                        <Label>Imagem de Capa</Label>
                        {thumbnailPreview ? (
                          <div className="relative mt-1 rounded-lg overflow-hidden border border-border">
                            <img src={thumbnailPreview} alt="Preview" className="h-36 w-full object-cover" />
                            <Button variant="destructive" size="icon" className="absolute right-2 top-2 h-7 w-7" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <label className="mt-1 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 hover:border-primary/50 transition-colors">
                            <Upload className="h-8 w-8 text-muted-foreground/40" />
                            <span className="text-sm text-muted-foreground">Clique para selecionar imagem</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
                          </label>
                        )}
                      </div>
                      <div className="flex items-center gap-2"><Switch checked={form.premium} onCheckedChange={(v) => setForm({ ...form, premium: v })} /><Label>Premium (exclusivo para assinantes)</Label></div>
                      <Button onClick={handleSubmit} disabled={saving || !form.title} className="w-full">{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}{uploadingThumb ? "Enviando imagem..." : "Criar e Gerenciar Conteúdo"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="heroOutline" size="xl" onClick={() => navigate("/instrutor/dashboard")}>
                  <BarChart3 className="mr-1 h-5 w-5" /> Meu Dashboard
                </Button>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              { label: "Cursos", value: `${courses.length}`, icon: BookOpen },
              { label: "Alunos", value: `${courses.reduce((s, c) => s + (c.enrollment_count || 0), 0)}`, icon: Users },
              { label: "Premium", value: `${courses.filter(c => c.premium).length}`, icon: Award },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 px-5 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-secondary-foreground">{stat.value}</div>
                  <div className="text-xs text-secondary-foreground/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="container pt-8 pb-4 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cursos por título, descrição ou empresa..."
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["Todos", "Premium", ...courseCategories].map(cat => (
            <Button key={cat} variant={filter === cat ? "default" : "outline"} size="sm" onClick={() => setFilter(cat)} className="rounded-full">
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container pb-10">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                onClick={() => navigate(`/curso/${course.id}`)}
                className="group flex cursor-pointer flex-col rounded-2xl border border-border bg-card card-shadow overflow-hidden transition-all hover:card-shadow-hover hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-secondary to-muted overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <GraduationCap className="h-12 w-12 text-muted-foreground/20" />
                      <span className="text-xs text-muted-foreground/30">{course.category}</span>
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:scale-100 scale-75 shadow-lg">
                      <Play className="h-6 w-6 ml-0.5" />
                    </div>
                  </div>
                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    {course.premium && <Badge className="bg-accent text-accent-foreground text-[10px] font-bold">Premium</Badge>}
                    {course.lesson_count! > 0 && <Badge variant="secondary" className="text-[10px]">{course.lesson_count} aulas</Badge>}
                  </div>
                  {user?.id === course.user_id && (
                    <Button variant="destructive" size="icon" className="absolute right-3 top-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDelete(e, course.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">{course.category}</span>
                    {course.avg_rating! > 0 && (
                      <span className="ml-auto flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-accent text-accent" /> {course.avg_rating!.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1 text-base font-bold text-card-foreground line-clamp-2">{course.title}</h3>
                  {course.description && <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{course.description}</p>}

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {course.module_count! > 0 && <span>{course.module_count} módulos</span>}
                      {course.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>}
                      {course.enrollment_count! > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrollment_count}</span>}
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="py-16 text-center">
            <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum curso encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
