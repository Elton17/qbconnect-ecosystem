import { motion } from "framer-motion";
import {
  ShieldCheck, FileText, Receipt, GraduationCap, BookOpen, Coins,
  CalendarDays, Heart, Megaphone, BarChart3, MessageCircle, Award,
  ArrowRight, ExternalLink, Briefcase, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicPageBanner from "@/components/ui/public-page-banner";
import servicesBannerAsset from "@/assets/regions/campina-centro.webp";

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
      <PublicPageBanner image={servicesBannerAsset} imageAlt="Vista de Campina Grande do Sul, Paraná" locationLabel="Campina Grande do Sul" eyebrow="Serviços especializados" title={<>Principais <span className="text-primary">Serviços</span></>} description="Somos a ponte que aproxima a indústria e a empresa do mercado, com soluções para o crescimento do seu negócio." icon={Briefcase} align="center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Serviços", value: `${services.length}`, icon: Briefcase },
              { label: "Com Link Direto", value: `${services.filter(s => s.link).length}`, icon: ExternalLink },
              { label: "Desde 1988", value: "36+", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-lg border border-secondary-foreground/15 bg-secondary/60 px-5 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/20">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-secondary-foreground">{stat.value}</div>
                  <div className="text-xs text-secondary-foreground/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
      </PublicPageBanner>

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
