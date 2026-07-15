import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Building2, Users, MapPin, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getWhatsAppUrl } from "@/lib/constants";

const waitlistSchema = z.object({
  company_name: z.string().trim().min(2, "Informe o nome da empresa.").max(120, "Nome da empresa muito longo."),
  cnpj: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length === 14, { message: "CNPJ deve conter 14 dígitos." })
    .refine(validateCNPJ, { message: "CNPJ inválido." }),
  contact_name: z.string().trim().min(2, "Informe o nome do responsável.").max(120, "Nome do responsável muito longo."),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 11, {
      message: "WhatsApp inválido. Use DDD + número.",
    }),
  segment: z.string().min(1, "Selecione o segmento."),
  is_associate: z.enum(["yes", "no"], { errorMap: () => ({ message: "Informe se a empresa é associada QBCAMP." }) }),
});


// ── Change this date to control the countdown ──
const LAUNCH_DATE = new Date("2026-08-15T00:00:00-03:00");

const segments = [
  "Indústria",
  "Comércio",
  "Serviços",
  "Tecnologia",
  "Saúde",
  "Construção",
  "Agronegócio",
  "Outro",
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function validateCNPJ(value: string) {
  const cnpj = value.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calcDigit = (base: string) => {
    const size = base.length;
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += Number(base.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  };
  const first = calcDigit(cnpj.substring(0, 12));
  if (first !== Number(cnpj.charAt(12))) return false;
  const second = calcDigit(cnpj.substring(0, 13));
  return second === Number(cnpj.charAt(13));
}


function useCountdown(target: Date) {
  const calc = useCallback(() => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      done: diff === 0,
    };
  }, [target]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

export default function PreLaunchPage() {
  const countdown = useCountdown(LAUNCH_DATE);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    cnpj: "",
    contact_name: "",
    whatsapp: "",
    segment: "",
    is_associate: "" as "" | "yes" | "no",
  });


  useEffect(() => {
    document.title = "Em Breve · QBCAMP Conecta+";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "A plataforma de negócios da QBCAMP está chegando. Marketplace, oportunidades e capacitação exclusivo para associados de Quatro Barras e Campina Grande do Sul.");
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = waitlistSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const key = i.path[0]?.toString() ?? "form";
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os campos.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("waitlist").insert({
      company_name: parsed.data.company_name,
      cnpj: parsed.data.cnpj,
      contact_name: parsed.data.contact_name,
      whatsapp: parsed.data.whatsapp,
      segment: parsed.data.segment,
      is_associate: parsed.data.is_associate === "yes",
    });

    setLoading(false);
    if (error) {
      toast.error("Erro ao cadastrar. Tente novamente ou entre em contato pelo WhatsApp.");
      return;
    }
    toast.success("Cadastro confirmado! Você está na lista.");
    setSubmitted(true);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{
        backgroundColor: "#1A1A1A",
        background: "radial-gradient(ellipse at 0% 0%, rgba(200,30,30,0.05) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(200,30,30,0.05) 0%, transparent 50%), #1A1A1A",
      }}
    >
      <div className="w-full max-w-3xl flex flex-col items-center gap-8 md:gap-10">
        {/* ── LOGO ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 pt-4">
          <div className="flex items-baseline gap-1.5 font-heading">
            <span className="text-xl font-black text-white">QBCAMP</span>
            <span className="text-primary text-xs">●</span>
            <span className="text-xl font-black text-primary">Conecta+</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-4 py-1.5">
            <Lock className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-medium text-white">Acesso exclusivo para associados QBCAMP</span>
          </div>
        </motion.div>

        {/* ── HEADLINE ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center">
          <h1 className="font-heading text-4xl font-black leading-tight text-white md:text-6xl lg:text-7xl">
            A plataforma de negócios<br />
            da nossa região<br />
            <span className="text-primary">está chegando.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-lg leading-relaxed text-white/60">
            Marketplace, oportunidades, capacitação e muito mais — tudo em um só lugar, exclusivo para associados QBCAMP.
          </p>
        </motion.div>

        {/* ── COUNTDOWN ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {countdown.done ? (
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-heading text-lg font-bold text-white hover:bg-primary-dark transition-colors">
              🎉 Estamos no ar! Acesse agora →
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {[
                { value: countdown.days, label: "Dias" },
                { value: countdown.hours, label: "Horas" },
                { value: countdown.minutes, label: "Minutos" },
                { value: countdown.seconds, label: "Segundos" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm"
                >
                  <span className="font-heading text-4xl font-black text-white md:text-5xl">
                    {pad(item.value)}
                  </span>
                  <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/40">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── FORM / SUCCESS ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full max-w-[480px]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            {submitted ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary" />
                <h3 className="font-heading text-xl font-bold text-white">Você está na lista!</h3>
                <p className="text-sm leading-relaxed text-white/60">
                  Assim que o QBCAMP Conecta+ abrir, você será um dos primeiros a saber. Fique de olho no seu WhatsApp.
                </p>
                <Button variant="outline" asChild className="mt-2 border-white/30 text-white hover:bg-white/10">
                  <a href="https://qbcamp.com.br" target="_blank" rel="noopener noreferrer">
                    Enquanto isso, conheça a QBCAMP
                  </a>
                </Button>
              </div>
            ) : (
              <>
                <h3 className="mb-1 font-heading text-lg font-bold text-white">Quero ser um dos primeiros</h3>
                <p className="mb-6 text-sm text-white/50">
                  Cadastre sua empresa e receba acesso assim que a plataforma abrir.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <Input
                      placeholder="Ex: Metalúrgica Souza Ltda"
                      value={form.company_name}
                      maxLength={120}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      aria-invalid={!!errors.company_name}
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    />
                    {errors.company_name && <p className="mt-1 text-xs text-primary">{errors.company_name}</p>}
                  </div>
                  <div>
                    <Input
                      placeholder="Nome do responsável"
                      value={form.contact_name}
                      maxLength={120}
                      onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                      aria-invalid={!!errors.contact_name}
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    />
                    {errors.contact_name && <p className="mt-1 text-xs text-primary">{errors.contact_name}</p>}
                  </div>
                  <div>
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="(41) 99999-9999"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: formatPhone(e.target.value) })}
                      aria-invalid={!!errors.whatsapp}
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    />
                    {errors.whatsapp && <p className="mt-1 text-xs text-primary">{errors.whatsapp}</p>}
                  </div>
                  <div>
                    <Select value={form.segment} onValueChange={(v) => setForm({ ...form, segment: v })}>
                      <SelectTrigger aria-invalid={!!errors.segment} className="border-white/20 bg-white/10 text-white [&>span]:text-white/40 data-[state=open]:ring-primary focus:ring-primary">
                        <SelectValue placeholder="Segmento da empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {segments.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.segment && <p className="mt-1 text-xs text-primary">{errors.segment}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-white/70">Sua empresa já é associada QBCAMP?</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "yes", label: "Sim, sou associada" },
                        { value: "no", label: "Ainda não" },
                      ].map((opt) => {
                        const active = form.is_associate === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setForm({ ...form, is_associate: opt.value as "yes" | "no" })}
                            className={`rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                              active
                                ? "border-primary bg-primary/20 text-white"
                                : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {errors.is_associate && <p className="mt-1 text-xs text-primary">{errors.is_associate}</p>}
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary font-heading font-bold text-white hover:bg-primary-dark">
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                    ) : (
                      "Quero garantir meu acesso →"
                    )}
                  </Button>
                </form>
                {/* WhatsApp fallback */}
                <div className="mt-4 text-center">
                  <a
                    href={getWhatsAppUrl("Olá! Quero participar do QBCAMP Conecta+ quando abrir.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Ou fale conosco pelo WhatsApp
                  </a>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* ── SOCIAL PROOF ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid w-full max-w-md grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { icon: Building2, number: "37+", label: "Anos de história" },
            { icon: Users, number: "100+", label: "Empresas associadas" },
            { icon: MapPin, number: "2", label: "Cidades atendidas" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <item.icon className="mb-1 h-5 w-5 text-primary" />
              <span className="font-heading text-3xl font-extrabold text-white">{item.number}</span>
              <span className="text-sm text-white/50">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── FOOTER ── */}
        <div className="mt-4 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-white/30">
            © 2026 QBCAMP · Associação Industrial e Comercial de Quatro Barras e Campina Grande do Sul
          </p>
          <Link to="/cadastro" className="text-xs text-white/40 hover:text-white/60 transition-colors">
            Já sou associado → Fazer cadastro
          </Link>
        </div>
      </div>
    </div>
  );
}
