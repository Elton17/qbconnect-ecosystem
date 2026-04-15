import { Link } from "react-router-dom";
import { Link2, Phone, MessageCircle } from "lucide-react";
import { QBCAMP_PHONE, QBCAMP_PHONE_DISPLAY, QBCAMP_HOURS, QBCAMP_WHATSAPP, getWhatsAppUrl } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
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
              <li><Link to="/academia" className="hover:text-primary transition-colors">Escola de Negócios</Link></li>
              <li><Link to="/eventos" className="hover:text-primary transition-colors">Eventos</Link></li>
              <li><Link to="/beneficios" className="hover:text-primary transition-colors">Benefícios</Link></li>
              <li><Link to="/cadastro" className="hover:text-primary transition-colors font-semibold text-primary">Cadastre sua Empresa</Link></li>
              <li><Link to="/sac" className="hover:text-primary transition-colors">SAC</Link></li>
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div>
            <h4 className="mb-3 text-sm font-heading font-bold text-white">Contato</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href={`tel:${QBCAMP_PHONE}`} className="hover:text-primary transition-colors">{QBCAMP_PHONE_DISPLAY}</a>
              </li>
              <li>{QBCAMP_HOURS}</li>
            </ul>
            <a
              href={getWhatsAppUrl("Olá! Preciso de ajuda com o QBCAMP Conecta+.")}
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
