import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, Handshake, LayoutDashboard, GraduationCap, Trophy, Gift, LogOut, Building2, Briefcase, CalendarDays, Moon, Sun, Search, Phone, Crown, Link2, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import GlobalSearch from "./GlobalSearch";

const navItems = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Oportunidades", href: "/oportunidades" },
  { label: "Academia", href: "/academia" },
  { label: "Eventos", href: "/eventos" },
  { label: "Benefícios", href: "/beneficios" },
  { label: "Planos", href: "/planos" },
];

const mobileNavItems = [
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Serviços", href: "/servicos", icon: Briefcase },
  { label: "Oportunidades", href: "/oportunidades", icon: Handshake },
  { label: "Academia", href: "/academia", icon: GraduationCap },
  { label: "Eventos", href: "/eventos", icon: CalendarDays },
  { label: "Benefícios", href: "/beneficios", icon: Gift },
  { label: "Ranking", href: "/ranking", icon: Trophy },
  { label: "SAC", href: "/sac", icon: Phone },
  { label: "Planos", href: "/planos", icon: Crown },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary-dark text-white text-sm hidden md:block">
        <div className="container flex items-center justify-center gap-4 h-9">
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            (41) 3672-1041
          </span>
          <span className="text-white/40">·</span>
          <span>Seg-Sex 08h às 17h</span>
          <span className="text-white/40">·</span>
          <span>Quatro Barras & Campina Grande do Sul</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            <div className="flex items-baseline gap-1 font-heading">
              <span className="text-lg font-bold text-primary">QBCAMP</span>
              <span className="text-lg font-bold text-foreground">Conecta+</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  location.pathname === item.href
                    ? "text-primary bg-primary/5"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)} className="gap-2 text-muted-foreground">
              <Search className="h-4 w-4" /> Buscar...
              <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 text-foreground">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="sm" asChild className="text-foreground">
                <Link to="/admin"><LayoutDashboard className="mr-1 h-4 w-4" /> Admin</Link>
              </Button>
            )}
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="text-foreground">
                  <Link to="/perfil"><Building2 className="mr-1 h-4 w-4" /> Meu Perfil</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="text-foreground">
                  <LogOut className="mr-1 h-4 w-4" /> Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="text-foreground">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary text-white hover:bg-primary-dark rounded-md font-heading font-bold">
                  <a href="https://qbcamp.com.br/filiacao" target="_blank" rel="noopener noreferrer">Associe-se</a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-1 lg:hidden">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 text-foreground">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <button className="p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border bg-white lg:hidden"
            >
              <nav className="container flex flex-col gap-1 py-4">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
                  {isAdmin && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/admin" onClick={() => setMobileOpen(false)}>
                        <LayoutDashboard className="mr-1 h-4 w-4" /> Painel Admin
                      </Link>
                    </Button>
                  )}
                  {user ? (
                    <>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/perfil" onClick={() => setMobileOpen(false)}>
                          <Building2 className="mr-1 h-4 w-4" /> Meu Perfil
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                        <LogOut className="mr-1 h-4 w-4" /> Sair
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/login" onClick={() => setMobileOpen(false)}>Entrar</Link>
                      </Button>
                      <Button size="sm" asChild className="bg-primary text-white hover:bg-primary-dark">
                        <a href="https://qbcamp.com.br/filiacao" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>Associe-se</a>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </header>
    </>
  );
}