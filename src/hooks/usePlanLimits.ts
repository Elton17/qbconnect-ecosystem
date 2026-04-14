import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getPlanLimits } from "@/lib/plans";

export function usePlanLimits() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<string>("basic");
  const [counts, setCounts] = useState({ products: 0, opportunities: 0, benefits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function fetch() {
      const [profileRes, productsRes, oppsRes, benefitsRes] = await Promise.all([
        supabase.from("profiles").select("plan").eq("user_id", user!.id).single(),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("active", true),
        supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("active", true).eq("status", "open"),
        supabase.from("benefits").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("active", true),
      ]);

      setPlan(profileRes.data?.plan || "basic");
      setCounts({
        products: productsRes.count || 0,
        opportunities: oppsRes.count || 0,
        benefits: benefitsRes.count || 0,
      });
      setLoading(false);
    }
    fetch();
  }, [user]);

  const limits = getPlanLimits(plan);

  return {
    plan,
    limits,
    counts,
    loading,
    canAddProduct: counts.products < limits.products,
    canAddOpportunity: counts.opportunities < limits.opportunities,
    canAddBenefit: counts.benefits < limits.benefits,
    isPremium: plan === "premium",
  };
}
