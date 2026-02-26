import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MapPin, Globe, Phone, Mail, Building2, ArrowLeft, Loader2, Briefcase, GraduationCap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Profile {
  id: string;
  company_name: string;
  segment: string;
  city: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  phone: string;
  email: string;
  address: string | null;
  plan: string;
  user_id: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  type: string;
  value: string | null;
  urgent: boolean | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  duration: string | null;
  premium: boolean | null;
}

interface Benefit {
  id: string;
  offer: string;
  category: string | null;
  exclusive: boolean | null;
}

export default function CompanyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const [profileRes, oppsRes, coursesRes, benefitsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).eq("approved", true).single(),
        supabase.from("opportunities").select("*").eq("user_id", "").eq("active", true), // placeholder
        supabase.from("courses").select("*").eq("user_id", "").eq("active", true),
        supabase.from("benefits").select("*").eq("user_id", "").eq("active", true),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        // Now fetch related data using the profile's user_id
        const userId = profileRes.data.user_id;
        const [o, c, b] = await Promise.all([
          supabase.from("opportunities").select("id, title, description, type, value, urgent").eq("user_id", userId).eq("active", true),
          supabase.from("courses").select("id, title, description, category, duration, premium").eq("user_id", userId).eq("active", true),
          supabase.from("benefits").select("id, offer, category, exclusive").eq("user_id", userId).eq("active", true),
        ]);
        setOpportunities(o.data || []);
        setCourses(c.data || []);
        setBenefits(b.data || []);
      }
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Empresa não encontrada</h2>
        <p className="mb-6 text-muted-foreground">Esta empresa não existe ou ainda não foi aprovada.</p>
        <Link to="/marketplace">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Marketplace</Button>
        </Link>
      </div>
    );
  }

  const totalItems = opportunities.length + courses.length + benefits.length;

  return (
    <div className="container py-8">
      <Link to="/marketplace" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar ao Marketplace
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Logo */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-bold text-primary overflow-hidden">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt={profile.company_name} className="h-full w-full object-cover" />
              ) : (
                profile.company_name.charAt(0)
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">{profile.company_name}</h1>
                <Badge variant="secondary">{profile.segment}</Badge>
                <Badge variant="outline" className="capitalize">{profile.plan}</Badge>
              </div>
              <p className="mb-4 text-muted-foreground">{profile.description || "Sem descrição disponível."}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.city && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{profile.city}</span>
                )}
                {profile.address && (
                  <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />{profile.address}</span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{profile.phone}</span>
                )}
                {profile.email && (
                  <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{profile.email}</span>
                )}
                {profile.website && (
                  <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                    <Globe className="h-4 w-4" />{profile.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="opportunities" className="gap-1.5">
            <Briefcase className="h-4 w-4" /> Oportunidades ({opportunities.length})
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-1.5">
            <GraduationCap className="h-4 w-4" /> Cursos ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="benefits" className="gap-1.5">
            <Gift className="h-4 w-4" /> Benefícios ({benefits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          {opportunities.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhuma oportunidade publicada.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {opportunities.map((opp) => (
                <Card key={opp.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{opp.title}</CardTitle>
                      <div className="flex gap-1.5">
                        <Badge variant="outline">{opp.type}</Badge>
                        {opp.urgent && <Badge variant="destructive">Urgente</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{opp.description || "Sem descrição"}</p>
                    {opp.value && <p className="mt-2 text-sm font-medium text-foreground">Valor: {opp.value}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses">
          {courses.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhum curso publicado.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{course.title}</CardTitle>
                      <div className="flex gap-1.5">
                        {course.category && <Badge variant="outline">{course.category}</Badge>}
                        {course.premium && <Badge variant="secondary">Premium</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description || "Sem descrição"}</p>
                    {course.duration && <p className="mt-2 text-xs text-muted-foreground">Duração: {course.duration}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="benefits">
          {benefits.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhum benefício publicado.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <Card key={benefit.id}>
                  <CardContent className="pt-6">
                    <div className="mb-2 flex items-center justify-between">
                      {benefit.category && <Badge variant="outline">{benefit.category}</Badge>}
                      {benefit.exclusive && <Badge variant="secondary">Exclusivo</Badge>}
                    </div>
                    <p className="text-sm text-foreground">{benefit.offer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {totalItems === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">Esta empresa ainda não publicou conteúdo.</p>
      )}
    </div>
  );
}
