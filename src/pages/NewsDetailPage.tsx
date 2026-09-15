import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { attachNewsPresentation, type NewsItem } from "@/lib/news";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  usePageTitle(item?.title || "Notícia");
  useEffect(() => { (async () => {
    if (!id) return;
    const { data } = await supabase.from("news").select("*").eq("id", id).eq("status", "approved").maybeSingle();
    setItem(data ? (await attachNewsPresentation([data]))[0] || null : null);
    setLoading(false);
  })(); }, [id]);
  if (loading) return <div className="container py-16"><Skeleton className="mx-auto h-[520px] max-w-4xl" /></div>;
  if (!item) return <div className="container py-24 text-center"><FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><h1 className="text-2xl font-bold">Notícia não encontrada</h1><Button asChild className="mt-6"><Link to="/noticias">Voltar às notícias</Link></Button></div>;
  return <article className="pb-20"><header className="border-b border-border bg-card"><div className="container max-w-4xl py-10 md:py-16"><Button variant="ghost" asChild className="mb-7 px-0"><Link to="/noticias"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar às notícias</Link></Button><Badge>{item.category}</Badge><h1 className="mt-5 text-3xl font-extrabold leading-tight md:text-5xl">{item.title}</h1><p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">{item.summary}</p><div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Por {item.company_name}</span><span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {format(new Date(item.published_at || item.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span></div></div></header>{item.cover_url && <div className="container max-w-5xl py-8"><img src={item.cover_url} alt={item.title} className="max-h-[620px] w-full rounded-md object-cover" /></div>}<div className="container max-w-3xl"><div className="whitespace-pre-line text-base leading-8 text-foreground md:text-lg">{item.content}</div></div></article>;
}
