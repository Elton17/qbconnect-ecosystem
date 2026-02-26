import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Sparkles, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MatchCompany {
  id: string;
  company_name: string;
  segment: string;
  city: string;
  description: string | null;
  logo_url: string | null;
}

interface Props {
  currentCompanyId: string;
  segment: string;
  city: string;
}

export default function CompanyMatchmaking({ currentCompanyId, segment, city }: Props) {
  const [sameCity, setSameCity] = useState<MatchCompany[]>([]);
  const [sameSegment, setSameSegment] = useState<MatchCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      // Complementary: same city, different segment
      const [cityRes, segRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, company_name, segment, city, description, logo_url")
          .eq("approved", true)
          .eq("city", city)
          .neq("segment", segment)
          .neq("id", currentCompanyId)
          .limit(6),
        supabase
          .from("profiles")
          .select("id, company_name, segment, city, description, logo_url")
          .eq("approved", true)
          .eq("segment", segment)
          .neq("id", currentCompanyId)
          .limit(6),
      ]);

      setSameCity(cityRes.data || []);
      setSameSegment(segRes.data || []);
      setLoading(false);
    }

    fetchMatches();
  }, [currentCompanyId, segment, city]);

  if (loading) return null;

  const hasMatches = sameCity.length > 0 || sameSegment.length > 0;
  if (!hasMatches) return null;

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Empresas Sugeridas</h2>
      </div>

      {sameCity.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Complementares na mesma cidade
          </div>
          <MatchGrid companies={sameCity} />
        </div>
      )}

      {sameSegment.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Mesmo segmento
          </div>
          <MatchGrid companies={sameSegment} />
        </div>
      )}
    </div>
  );
}

function MatchGrid({ companies }: { companies: MatchCompany[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company, i) => (
        <motion.div
          key={company.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
        >
          <Link
            to={`/empresa/${company.id}`}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary overflow-hidden">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
              ) : (
                company.company_name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">
                {company.company_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{company.segment} · {company.city}</p>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
