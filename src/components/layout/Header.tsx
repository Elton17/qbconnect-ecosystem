import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, Handshake, LayoutDashboard, GraduationCap, Trophy, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Oportunidades", href: "/oportunidades", icon: Handshake },
  { label: "Academia", href: "/academia", icon: GraduationCap },
  { label: "Ranking", href: "/ranking", icon: Trophy },
  { label: "Benefícios", href: "/beneficios", icon: Gift },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-extrabold text-primary-foreground">QB</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold text-foreground">QBCAMP</span>
            <span className="text-xs font-medium text-primary">Conecta+</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">
              <LayoutDashboard className="mr-1 h-4 w-4" />
              Admin
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/cadastro">Cadastrar</Link>
          </Button>
          <Button size="sm">Entrar</Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card md:hidden"
          >
            <nav className="container flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="mr-1 h-4 w-4" />
                    Painel Admin
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/cadastro" onClick={() => setMobileOpen(false)}>Cadastrar</Link>
                </Button>
                <Button size="sm">Entrar</Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
