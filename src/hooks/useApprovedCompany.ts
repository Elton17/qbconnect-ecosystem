import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useApprovedCompany() {
  const { user, loading: authLoading } = useAuth();
  const [approved, setApproved] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setApproved(false);
      setHasProfile(false);
      setChecking(false);
      return;
    }

    supabase
      .from("profiles")
      .select("approved, company_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setHasProfile(!!data && !!data.company_name);
        setApproved(!!data?.approved);
        setChecking(false);
      });
  }, [user, authLoading]);

  return { user, approved, hasProfile, checking, authLoading };
}
