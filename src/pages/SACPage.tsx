import { useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { QBCAMP_WHATSAPP, QBCAMP_PHONE, QBCAMP_PHONE_DISPLAY, QBCAMP_HOURS, getWhatsAppUrl } from "@/lib/constants";

const faqs = [
  { q: "Como me torno associado da QBCAMP?", a: "O processo de associação é feito diretamente com a QBCAMP. Entre em contato pelo WhatsApp ou telefone e nossa equipe vai te orientar." },
  { q: "Preciso ser associado para usar o Conecta+?", a: "Sim. O QBCAMP Conecta+ é exclusivo para empresas associadas à QBCAMP, garantindo uma rede confiável e qualificada de negócios." },
  { q: "Como cadastro minha empresa na plataforma?", a: "Após se tornar associado, acesse /cadastro, preencha os dados da sua empresa com CNPJ e aguarde a aprovação da equipe QBCAMP. O prazo é de até 2 dias úteis." },
  { q: "Como funciona o Marketplace?", a: "Empresas aprovadas podem cadastrar produtos e serviços. O contato entre comprador e vendedor é feito diretamente via WhatsApp, de forma rápida e humanizada." },
  { q: "O que são as Oportunidades?", a: "É onde empresas publicam demandas reais: procuro fornecedor, busco parceiro, estou contratando. Qualquer associado pode demonstrar interesse e negociar diretamente." },
  { q: "Como funciona o Ranking?", a: "O ranking pontua empresas por engajamento real: negócios fechados, cursos publicados e benefícios cadastrados. As melhores recebem selos e destaque na plataforma." },
  { q: "O que é o plano Premium?", a: "O plano Premium oferece mais slots de produtos, destaque nas listagens e badge especial. Entre em contato com a QBCAMP para fazer upgrade." },
  { q: "Como verifico um certificado da Academia?", a: "Acesse /certificado e insira o código do certificado para validar a autenticidade." },
];

export default function SACPage() {
  useEffect(() => {
    document.title = "Central de Atendimento · QBCAMP Conecta+";
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-secondary py-14 md:py-20">
        <div className="h-[3px] bg-primary absolute top-0 left-0 right-0" />
        <div className="container relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-heading font-extrabold text-white md:text-5xl">
              Central de <span className="text-primary">Atendimento</span>
            </h1>
            <p className="mt-3 text-lg text-white/60">
              Tire suas dúvidas sobre o QBCAMP Conecta+
            </p>
          </motion.div>
        </div>
      </section>

      {/* Channels */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-3">
          {/* WhatsApp */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full text-center">
              <CardContent className="flex flex-col items-center pt-8 pb-6 px-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/10">
                  <MessageCircle className="h-7 w-7 text-[#25D366]" />
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground">WhatsApp</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Atendimento rápido de {QBCAMP_HOURS}
                </p>
                <Button asChild className="mt-5 w-full bg-[#25D366] text-white hover:bg-[#1da851]">
                  <a href={getWhatsAppUrl("Olá! Preciso de ajuda com o QBCAMP Conecta+.")} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-1.5 h-4 w-4" /> Chamar no WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Phone */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full text-center">
              <CardContent className="flex flex-col items-center pt-8 pb-6 px-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground">Telefone</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {QBCAMP_PHONE_DISPLAY} · {QBCAMP_HOURS}
                </p>
                <Button variant="outline" asChild className="mt-5 w-full">
                  <a href={`tel:${QBCAMP_PHONE}`}>
                    <Phone className="mr-1.5 h-4 w-4" /> Ligar agora
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* In-person */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full text-center">
              <CardContent className="flex flex-col items-center pt-8 pb-6 px-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground">Sede QBCAMP</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quatro Barras e Campina Grande do Sul, PR
                </p>
                <Button variant="outline" asChild className="mt-5 w-full">
                  <a href="https://maps.google.com/?q=QBCAMP+Quatro+Barras+PR" target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-1.5 h-4 w-4" /> Ver endereço
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-heading font-bold text-foreground">
            Perguntas Frequentes
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border bg-card px-5">
                <AccordionTrigger className="text-left text-sm font-heading font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
