import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Play, Clock, Plus, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  company_name?: string;
}

export default function AcademyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Marketing", duration: "", premium: false, description: "" });

  const fetchData = async () => {
    const { data: items } = await supabase.from("courses").select("*").eq("active", true).order("created_at", { ascending: false });
    if (!items) { setLoading(false); return; }

    const userIds = [...new Set(items.map((c: any) => c.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, company_name").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.company_name]));

    setCourses(items.map((c: any) => ({ ...c, company_name: profileMap.get(c.user_id) || "QBCAMP Academy" })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("courses").insert({
      user_id: user.id,
      title: form.title,
      category: form.category,
      duration: form.duration,
      premium: form.premium,
      description: form.description,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Curso criado!" });
      setForm({ title: "", category: "Marketing", duration: "", premium: false, description: "" });
      setDialogOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("courses").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold text-foreground">Academia QBCAMP</h1>
            <p className="text-muted-foreground">Capacite sua equipe com cursos criados por empresas da região.</p>
          </div>
          {user && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="lg"><Plus className="mr-1 h-4 w-4" /> Criar Curso</Button>
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
                  <div><Label>Duração</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Ex: 4h" /></div>
                  <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                  <div className="flex items-center gap-2"><Switch checked={form.premium} onCheckedChange={(v) => setForm({ ...form, premium: v })} /><Label>Premium</Label></div>
                  <Button onClick={handleSubmit} disabled={saving || !form.title} className="w-full">{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Criar Curso</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <motion.div key={course.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="group flex flex-col rounded-2xl border border-border bg-card card-shadow overflow-hidden transition-all hover:card-shadow-hover hover:-translate-y-1">
                <div className="relative flex h-40 items-center justify-center bg-secondary">
                  <GraduationCap className="h-12 w-12 text-secondary-foreground/30" />
                  <button className="absolute inset-0 flex items-center justify-center bg-secondary/0 transition-colors group-hover:bg-secondary/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:scale-100 scale-75">
                      <Play className="h-6 w-6 ml-0.5" />
                    </div>
                  </button>
                  {course.premium && <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">Premium</span>}
                  {user?.id === course.user_id && (
                    <Button variant="destructive" size="icon" className="absolute left-3 top-3 h-7 w-7" onClick={() => handleDelete(course.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-1 text-xs font-medium text-primary">{course.category}</span>
                  <h3 className="mb-2 text-base font-bold text-card-foreground">{course.title}</h3>
                  {course.description && <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{course.description}</p>}
                  <p className="mb-3 text-sm text-muted-foreground">{course.company_name}</p>
                  <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                    {course.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && courses.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">Nenhum curso disponível ainda.</div>
        )}
      </div>
    </div>
  );
}
