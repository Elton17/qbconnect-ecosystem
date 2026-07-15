import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  renderAssociateEmail,
  renderNonAssociateEmail,
  SAMPLE_WAITLIST_DATA,
  type WaitlistEmailData,
} from "@/lib/waitlistEmailTemplates";

export default function EmailPreviewPage() {
  const [data, setData] = useState<WaitlistEmailData>(SAMPLE_WAITLIST_DATA);

  const associate = useMemo(() => renderAssociateEmail(data), [data]);
  const nonAssociate = useMemo(() => renderNonAssociateEmail(data), [data]);

  const update = (k: keyof WaitlistEmailData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
              <Link to="/admin"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar ao admin</Link>
            </Button>
            <h1 className="font-heading text-2xl font-black">Prévia dos e-mails de confirmação</h1>
            <p className="text-sm text-muted-foreground">
              Revise os dois templates antes de aprovar o envio automático após o pré-cadastro.
            </p>
          </div>
        </div>

        {/* Dados de exemplo */}
        <div className="mb-6 rounded-xl border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">Dados de exemplo (edite para testar)</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div><Label className="text-xs">Empresa</Label><Input value={data.company_name} onChange={update("company_name")} /></div>
            <div><Label className="text-xs">CNPJ</Label><Input value={data.cnpj} onChange={update("cnpj")} /></div>
            <div><Label className="text-xs">Responsável</Label><Input value={data.contact_name} onChange={update("contact_name")} /></div>
            <div><Label className="text-xs">WhatsApp</Label><Input value={data.whatsapp} onChange={update("whatsapp")} /></div>
            <div><Label className="text-xs">Segmento</Label><Input value={data.segment} onChange={update("segment")} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PreviewCard title="Template A — Empresa Associada" subject={associate.subject} html={associate.html} tone="green" />
          <PreviewCard title="Template B — Não Associada" subject={nonAssociate.subject} html={nonAssociate.html} tone="amber" />
        </div>

        <div className="mt-8 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          Aprove os templates respondendo no chat. Após sua aprovação, ativarei o envio automático (associadas recebem A, não associadas recebem B) logo após a submissão do pré-cadastro.
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ title, subject, html, tone }: { title: string; subject: string; html: string; tone: "green" | "amber" }) {
  const badge = tone === "green" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="border-b p-4">
        <div className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge}`}>
          {tone === "green" ? "Associada" : "Não associada"}
        </div>
        <div className="mt-2 font-heading text-base font-bold">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground"><span className="font-semibold">Assunto:</span> {subject}</div>
      </div>
      <iframe
        title={title}
        srcDoc={html}
        className="w-full"
        style={{ height: 780, border: 0, background: "#F9FAFB" }}
      />
    </div>
  );
}
