import { motion } from "framer-motion";
import { Phone, HelpCircle, ShoppingCart, Handshake, Target, GraduationCap, Gift, Star, CalendarDays, Building2, ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const sections = [
  {
    icon: HelpCircle,
    title: "O que é o QBCAMP Conecta+?",
    content: (
      <div className="space-y-3">
        <p>O QBCAMP Conecta+ é a nova plataforma oficial de negócios da QBCAMP.</p>
        <p>Um ambiente digital criado para que empresas da nossa região possam:</p>
        <ul className="space-y-2 pl-1">
          {["Vender produtos e serviços", "Gerar novas oportunidades comerciais", "Se conectar com outros empresários", "Participar de um ecossistema estruturado de crescimento"].map((item) => (
            <li key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{item}</span></li>
          ))}
        </ul>
        <p className="font-medium text-primary">Mais do que um marketplace, é um sistema completo que integra negócios, relacionamento e capacitação empresarial.</p>
      </div>
    ),
  },
  {
    icon: Building2,
    title: "Quem pode participar?",
    content: (
      <div className="space-y-3">
        <p>O acesso ao QBCAMP Conecta+ é <strong>exclusivo para empresas associadas à QBCAMP</strong>.</p>
        <p>Para divulgar, vender ou se cadastrar na plataforma, a empresa precisa ser associada. Isso garante:</p>
        <ul className="space-y-2 pl-1">
          {["Qualidade das empresas participantes", "Segurança nas negociações", "Credibilidade do ambiente", "Rede confiável de negócios"].map((item) => (
            <li key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{item}</span></li>
          ))}
        </ul>
        <p className="text-muted-foreground">Caso sua empresa ainda não seja associada, nossa equipe pode orientar você no processo de associação.</p>
      </div>
    ),
  },
  {
    icon: ShoppingCart,
    title: "O que posso fazer dentro da plataforma?",
    content: (
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-semibold"><ShoppingCart className="h-4 w-4 text-primary" /> Vender</h4>
          <ul className="space-y-1 pl-6 text-muted-foreground">
            <li>• Produtos</li><li>• Serviços</li><li>• Planos corporativos</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-semibold"><Handshake className="h-4 w-4 text-primary" /> Gerar negócios</h4>
          <ul className="space-y-1 pl-6 text-muted-foreground">
            <li>• Publicar oportunidades comerciais</li><li>• Encontrar fornecedores</li><li>• Buscar parceiros</li><li>• Fechar negócios diretamente na plataforma</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-semibold"><Target className="h-4 w-4 text-primary" /> Ganhar visibilidade</h4>
          <ul className="space-y-1 pl-6 text-muted-foreground">
            <li>• Perfil empresarial completo</li><li>• Destaque dentro da plataforma</li><li>• Participação em ranking empresarial</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-semibold"><GraduationCap className="h-4 w-4 text-primary" /> Se capacitar</h4>
          <ul className="space-y-1 pl-6 text-muted-foreground">
            <li>• Acesso a cursos online</li><li>• Aulas gravadas</li><li>• Conteúdos empresariais estratégicos</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-semibold"><Gift className="h-4 w-4 text-primary" /> Participar de um sistema inteligente de benefícios</h4>
          <ul className="space-y-1 pl-6 text-muted-foreground">
            <li>• Descontos e vantagens entre associados</li><li>• Benefícios exclusivos</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    icon: Star,
    title: "Qual o diferencial do QBCAMP Conecta+?",
    content: (
      <div className="space-y-3">
        <p>Diferente de marketplaces tradicionais, o QBCAMP Conecta+ é:</p>
        <ul className="space-y-2 pl-1">
          {["Regional", "Exclusivo para associados", "Baseado em relacionamento real", "Com empresas validadas", "Integrado com eventos presenciais", "Focado em geração de negócios entre empresários"].map((item) => (
            <li key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{item}</span></li>
          ))}
        </ul>
        <p className="text-muted-foreground">Inspirado em modelos de networking estruturado como o BNI, mas com tecnologia, controle e escala.</p>
      </div>
    ),
  },
  {
    icon: CalendarDays,
    title: "Isso substitui os eventos da QBCAMP?",
    content: (
      <div className="space-y-3">
        <p><strong>Não.</strong> O projeto complementa e potencializa tudo o que já existe.</p>
        <p>Os eventos continuam sendo fundamentais, mas agora:</p>
        <ul className="space-y-2 pl-1">
          {["As conexões não param no evento", "Os negócios continuam dentro da plataforma", "Os resultados passam a ser mensuráveis"].map((item) => (
            <li key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{item}</span></li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    icon: ArrowRight,
    title: "Como faço para participar?",
    content: (
      <div className="space-y-3">
        <p>O processo é simples:</p>
        <ol className="space-y-2 pl-1 list-decimal list-inside">
          <li>Ser associado à QBCAMP</li>
          <li>Solicitar acesso à plataforma</li>
          <li>Criar o perfil da sua empresa</li>
          <li>Começar a divulgar e gerar negócios</li>
        </ol>
        <p className="text-muted-foreground">Se você ainda não é associado, nossa equipe pode te orientar no processo de entrada.</p>
      </div>
    ),
  },
  {
    icon: Target,
    title: "Por que minha empresa deve participar?",
    content: (
      <div className="space-y-3">
        <p>Porque hoje não basta apenas estar presente. É preciso:</p>
        <ul className="space-y-2 pl-1">
          {["Estar conectado", "Estar visível", "Estar ativo em um ambiente de negócios"].map((item) => (
            <li key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{item}</span></li>
          ))}
        </ul>
        <p className="font-medium text-primary">O QBCAMP Conecta+ foi criado exatamente para isso:</p>
        <ul className="space-y-1 pl-1 font-medium">
          <li>👉 Transformar relacionamento em negócio</li>
          <li>👉 Transformar presença em resultado</li>
          <li>👉 Transformar a associação em um verdadeiro motor de crescimento empresarial</li>
        </ul>
      </div>
    ),
  },
];

export default function SACPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 h-64 w-64 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <Phone className="h-4 w-4" /> Central de Atendimento
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl">
              SAC – <span className="text-gradient">QBCAMP Conecta+</span>
            </h1>
            <p className="mb-8 text-lg text-secondary-foreground/70">
              Tire suas dúvidas sobre a plataforma, entenda como funciona e saiba como participar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
              </div>
              <div className="text-sm leading-relaxed text-foreground/80">
                {section.content}
              </div>
            </motion.div>
          ))}

          {/* CTA Final */}
          <motion.div
            custom={sections.length}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-8 text-center"
          >
            <MessageCircle className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-3 text-2xl font-bold text-foreground">Mensagem Final</h2>
            <p className="mb-2 text-foreground/80">
              Se a sua empresa já faz parte da QBCAMP, <strong>esse é o próximo passo natural</strong>.
            </p>
            <p className="mb-2 text-foreground/80">
              Se ainda não faz, <strong>esse é o melhor momento para entrar</strong>.
            </p>
            <p className="mb-6 font-medium text-primary">
              Porque mais do que fazer parte de uma associação, agora você pode fazer parte de um ecossistema que gera negócios de verdade.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="https://qbcamp.com.br/filiacao" target="_blank" rel="noopener noreferrer">Cadastrar Empresa <ArrowRight className="ml-1 h-4 w-4" /></a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/marketplace">Explorar Marketplace</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
