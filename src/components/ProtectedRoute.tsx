import { useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(!!requiredRole);
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    if (!requiredRole) {
      setChecking(false);
      return;
    }
    if (authLoading) {
      setChecking(true);
      return;
    }
    if (!user) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);
    supabase.rpc("has_role", { _user_id: user.id, _role: requiredRole }).then(({ data }) => {
      if (cancelled) return;
      setHasRole(!!data);
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user, requiredRole, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (requiredRole && !hasRole) return <Navigate to="/home" replace />;

  return <>{children}</>;
}
