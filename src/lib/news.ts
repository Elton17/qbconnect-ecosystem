import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type NewsItem = Database["public"]["Tables"]["news"]["Row"] & {
  company_name?: string;
  logo_url?: string | null;
  cover_url?: string | null;
};

export const NEWS_CATEGORIES = [
  "Agronegócio", "Comércio", "Construção", "Economia", "Educação",
  "Indústria", "Inovação", "Saúde", "Serviços", "Tecnologia", "Turismo", "Outro",
];

export async function attachNewsPresentation(items: Database["public"]["Tables"]["news"]["Row"][]): Promise<NewsItem[]> {
  const profileIds = [...new Set(items.map((item) => item.profile_id))];
  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id, company_name, logo_url").in("id", profileIds)
    : { data: [] };
  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return Promise.all(items.map(async (item) => {
    let coverUrl: string | null = null;
    if (item.cover_image_path) {
      const { data } = await supabase.storage.from("news").createSignedUrl(item.cover_image_path, 3600);
      coverUrl = data?.signedUrl || null;
    }
    const profile = profileMap.get(item.profile_id);
    return { ...item, company_name: profile?.company_name || "QBCAMP", logo_url: profile?.logo_url, cover_url: coverUrl };
  }));
}
