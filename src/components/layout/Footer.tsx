import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-xs font-extrabold text-primary-foreground">QB</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold">QBCAMP</span>
                <span className="text-xs font-medium text-primary">Conecta+</span>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/70">
              Ecossistema digital empresarial de Quatro Barras e Campina Grande do Sul.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Plataforma</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link to="/oportunidades" className="hover:text-primary transition-colors">Oportunidades</Link></li>
              <li><Link to="/academia" className="hover:text-primary transition-colors">Academia</Link></li>
              <li><Link to="/ranking" className="hover:text-primary transition-colors">Ranking</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Associação</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><a href="#" className="hover:text-primary transition-colors">Sobre nós</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Associe-se</a></li>
              <li><Link to="/beneficios" className="hover:text-primary transition-colors">Benefícios</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-secondary-foreground/10 pt-6 text-center text-xs text-secondary-foreground/50">
          © {new Date().getFullYear()} QBCAMP Conecta+. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
