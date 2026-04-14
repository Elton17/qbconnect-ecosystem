import { Link } from "react-router-dom";
import { Link2, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Red accent line */}
      <div className="h-[3px] bg-primary" />

      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Column 1 - Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="h-5 w-5 text-primary" />
              <span className="font-heading text-lg font-bold">
                <span className="text-primary">QBCAMP</span>{" "}
                <span className="text-white">Conecta+</span>
              </span>
            </div>
            <p className="text-sm text-white/70 max-w-xs">
              Ecossistema digital empresarial de Quatro Barras, Campina Grande do Sul, Colombo, Pinhais e Curitiba.
            </p>
            <p className="mt-3 text-xs text-white/40">
              Desde 1988 fortalecendo o comércio regional.
            </p>
          </div>

          {/* Column 2 - Links */}
          <div>
            <h4 className="mb-3 text-sm font-heading font-bold text-white">Plataforma</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link to="/oportunidades" className="hover:text-primary transition-colors">Oportunidades</Link></li>
              <li><Link to="/academia" className="hover:text-primary transition-colors">Academia</Link></li>
              <li><Link to="/eventos" className="hover:text-primary transition-colors">Eventos</Link></li>
              <li><Link to="/beneficios" className="hover:text-primary transition-colors">Benefícios</Link></li>
              <li><Link to="/planos" className="hover:text-primary transition-colors">Planos</Link></li>
              <li><Link to="/sac" className="hover:text-primary transition-colors">SAC</Link></li>
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div>
            <h4 className="mb-3 text-sm font-heading font-bold text-white">Contato</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+554136721041" className="hover:text-primary transition-colors">(41) 3672-1041</a>
              </li>
              <li>Seg-Sex 08h às 17h</li>
            </ul>
            <a
              href="https://wa.me/554136721041"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-heading font-bold text-white transition-colors hover:bg-primary-dark"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp QBCAMP
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} QBCAMP Conecta+ · Associação Industrial e Comercial de Quatro Barras e Campina Grande do Sul
        </div>
      </div>
    </footer>
  );
}