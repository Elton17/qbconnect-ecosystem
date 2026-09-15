import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, FileText, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { attachNewsPresentation, NEWS_CATEGORIES, type NewsItem } from "@/lib/news";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PublicPageBanner from "@/components/ui/public-page-banner";
import bannerNews from "@/assets/banner-news.jpg";

export default function NewsPage() {
  usePageTitle("Notícias");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");

  useEffect(() => { (async () => {
    const { data } = await supabase.from("news").select("*").eq("status", "approved").order("published_at", { ascending: false });
    setItems(await attachNewsPresentation(data || []));
    setLoading(false);
  })(); }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const term = search.trim().toLowerCase();
    return (category === "Todas" || item.category === category) && (!term || `${item.title} ${item.summary} ${item.company_name}`.toLowerCase().includes(term));
  }), [items, search, category]);
  const featured = filtered[0];

  return <div className="min-h-screen bg-background">
    <PublicPageBanner image={bannerNews} imageAlt="Entrevista com empresário da região" eyebrow="Portal de notícias" title="Informação que movimenta nossa região" description="Notícias, histórias e novidades das empresas que fazem parte do ecossistema QBCAMP." icon={FileText} />
    <main className="container py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full lg:max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" placeholder="Buscar por notícia ou empresa..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="flex gap-2 overflow-x-auto pb-1">{["Todas", ...NEWS_CATEGORIES].map((item) => <Button key={item} size="sm" variant={category === item ? "default" : "outline"} onClick={() => setCategory(item)}>{item}</Button>)}</div></div>
      {loading ? <div className="grid gap-5 md:grid-cols-3">{[1,2,3].map((item) => <Skeleton key={item} className="h-72" />)}</div> : !featured ? <div className="rounded-md border border-dashed border-border py-20 text-center"><FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><h2 className="text-xl font-bold">Nenhuma notícia encontrada</h2><p className="mt-2 text-sm text-muted-foreground">Novas publicações aparecerão aqui após a aprovação.</p></div> : <>
        <Link to={`/noticias/${featured.id}`} className="group mb-10 grid overflow-hidden border-y border-border bg-card md:grid-cols-[1.4fr_1fr] md:border"><div className="aspect-[16/9] overflow-hidden bg-muted md:aspect-auto md:min-h-96">{featured.cover_url ? <img src={featured.cover_url} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-16 w-16 text-muted-foreground/40" /></div>}</div><div className="flex flex-col justify-center p-6 md:p-10"><Badge className="mb-4 w-fit">{featured.category}</Badge><h2 className="text-2xl font-extrabold leading-tight text-card-foreground md:text-4xl">{featured.title}</h2><p className="mt-4 line-clamp-4 text-muted-foreground">{featured.summary}</p><NewsMeta item={featured} /></div></Link>
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{filtered.slice(1).map((item) => <Link key={item.id} to={`/noticias/${item.id}`} className="group border-b border-border pb-6"><div className="mb-4 aspect-[16/9] overflow-hidden rounded-md bg-muted">{item.cover_url ? <img src={item.cover_url} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-10 w-10 text-muted-foreground/40" /></div>}</div><Badge variant="outline">{item.category}</Badge><h2 className="mt-3 text-xl font-bold leading-snug text-foreground group-hover:text-primary">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.summary}</p><NewsMeta item={item} /></Link>)}</div>
      </>}
    </main>
  </div>;
}

function NewsMeta({ item }: { item: NewsItem }) {
  const date = item.published_at || item.created_at;
  return <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{item.company_name}</span><span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span></div>;
}
