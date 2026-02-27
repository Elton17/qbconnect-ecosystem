import { motion } from "framer-motion";
import {
  ShieldCheck, FileText, Receipt, GraduationCap, BookOpen, Coins,
  CalendarDays, Heart, Megaphone, BarChart3, MessageCircle, Award,
  ArrowRight, ExternalLink, Briefcase, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { title: "Consulta ao SCPC", description: "Informações na área de liberação de crédito, consultas, registros ao SCPC, bancos e cartórios.", icon: ShieldCheck, link: "https://associado.scpc.inf.br/?entidade=83420" },
  { title: "Certificado Digital", description: "Compra e validação do certificado digital, presencial ou on-line, sem filas e sem burocracia.", icon: FileText, link: "https://api.whatsapp.com/send?phone=5541991228567" },
  { title: "Emissão de Nota Fiscal", description: "Sistema de gestão online simples e eficiente que se adapta a todos os tipos de negócios.", icon: Receipt, link: "https://myrp.com.br/qbcamp" },
  { title: "Cursos e Palestras", description: "Cursos e palestras voltados para a indústria e comércio, com conteúdo técnico e prático.", icon: GraduationCap },
  { title: "Revista QBCAMP", description: "Mais que um informativo, um canal de divulgação dos serviços e das empresas associadas.", icon: BookOpen, link: "https://www.yumpu.com/xx/document/read/70641702/qbcamp-revista-edicao-16-ano-2025" },
  { title: "QBCAMP Credi", description: "Parcerias para facilitar o acesso ao crédito para seu negócio crescer.", icon: Coins },
  { title: "Feiras e Networking", description: "Evento de empreendedorismo, exposição de produtos e serviços.", icon: CalendarDays },
  { title: "QBCAMP Mulher", description: "Formado por mulheres empresárias, executivas e profissionais liberais de todas as categorias.", icon: Heart, link: "https://qbcamp.com.br/conselho-da-mulher-qbcamp/" },
  { title: "Campanhas Promocionais", description: "Campanhas para promover vendas e fortalecer o comércio local.", icon: Megaphone },
  { title: "Inteligência de Mercado", description: "Saiba quem é seu cliente potencial através de filtros e mapeamento por região ou ramo de atividade.", icon: BarChart3 },
  { title: "Grupo Empresarial", description: "Grupo de WhatsApp exclusivo para divulgação e networking entre os associados.", icon: MessageCircle },
  { title: "SEBRAE", description: "Cursos, palestras, rodada de negócios e eventos em parceria com o SEBRAE.", icon: Award },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export default function ServicosPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-16 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-10 -top-20 h-80 w-80 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <Briefcase className="h-4 w-4" /> Serviços Especializados
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl">
              Principais <span className="text-gradient">Serviços</span>
            </h1>
            <p className="mb-6 text-lg text-secondary-foreground/70">
              Somos a ponte que aproxima a indústria e a empresa do mercado. Oferecemos os mais diversos serviços para o crescimento do seu negócio.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              { label: "Serviços", value: `${services.length}`, icon: Briefcase },
              { label: "Com Link Direto", value: `${services.filter(s => s.link).length}`, icon: ExternalLink },
              { label: "Desde 1988", value: "36+", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 px-5 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-secondary-foreground">{stat.value}</div>
                  <div className="text-xs text-secondary-foreground/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service, i) => (
            <motion.div key={service.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="group rounded-2xl border border-border bg-card p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <service.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-card-foreground">{service.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{service.description}</p>
              {service.link && (
                <a href={service.link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">Saiba mais <ExternalLink className="ml-1 h-3.5 w-3.5" /></Button>
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 rounded-2xl bg-secondary p-8 text-center md:p-12">
          <h2 className="mb-3 text-2xl font-extrabold text-secondary-foreground md:text-3xl">
            Quer aproveitar todos esses serviços?
          </h2>
          <p className="mb-6 text-secondary-foreground/70">
            Associe-se à QBCAMP e tenha acesso a todos os benefícios exclusivos para sua empresa.
          </p>
          <a href="https://api.whatsapp.com/send?phone=5541998064987&text=Olá! Gostaria de me associar à QBCAMP." target="_blank" rel="noopener noreferrer">
            <Button variant="hero" size="xl">Quero me associar <ArrowRight className="ml-1 h-5 w-5" /></Button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
