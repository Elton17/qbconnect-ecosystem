import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search, Award, CheckCircle2, XCircle, Loader2, GraduationCap } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

interface CertData {
  certificate_code: string;
  issued_at: string;
  course_title: string;
  company_name: string;
}

export default function CertificateVerifyPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);

    const { data: cert } = await supabase
      .from("certificates")
      .select("certificate_code, issued_at, course_id, user_id")
      .eq("certificate_code", code.trim())
      .maybeSingle();

    if (!cert) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const [courseRes, profileRes] = await Promise.all([
      supabase.from("courses").select("title").eq("id", cert.course_id).single(),
      supabase.from("profiles").select("company_name, contact_name").eq("user_id", cert.user_id).single(),
    ]);

    setResult({
      certificate_code: cert.certificate_code,
      issued_at: cert.issued_at,
      course_title: courseRes.data?.title || "Curso",
      company_name: profileRes.data?.contact_name || profileRes.data?.company_name || "Participante",
    });
    setLoading(false);
  };

  return (
    <div className="container max-w-2xl py-12">
      <Breadcrumbs items={[{ label: "Verificar Certificado" }]} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-2 text-3xl font-extrabold text-foreground">Verificar Certificado</h1>
        <p className="mb-8 text-muted-foreground">
          Insira o código do certificado para verificar sua autenticidade.
        </p>

        <div className="mx-auto flex max-w-md gap-2">
          <Input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Digite o código do certificado"
            onKeyDown={e => e.key === "Enter" && handleVerify()}
            className="text-center font-mono tracking-wider"
          />
          <Button onClick={handleVerify} disabled={loading || !code.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mt-8 max-w-md rounded-2xl border-2 border-primary/20 bg-card p-6 text-left card-shadow"
          >
            <div className="mb-4 flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold">Certificado Válido</span>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Participante</p>
                <p className="font-semibold text-foreground">{result.company_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Curso</p>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" /> {result.course_title}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Código</p>
                <p className="font-mono font-semibold text-foreground">{result.certificate_code}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Emitido em</p>
                <p className="font-semibold text-foreground">
                  {new Date(result.issued_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {notFound && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mx-auto mt-8 max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center"
          >
            <XCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
            <p className="font-semibold text-foreground">Certificado não encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">Verifique o código digitado e tente novamente.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
