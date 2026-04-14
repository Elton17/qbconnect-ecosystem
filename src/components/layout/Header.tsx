import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, Handshake, LayoutDashboard, GraduationCap, Trophy, Gift, LogOut, Building2, Briefcase, CalendarDays, Moon, Sun, Search, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import GlobalSearch from "./GlobalSearch";
const navItems = [
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Serviços", href: "/servicos", icon: Briefcase },
  { label: "Oportunidades", href: "/oportunidades", icon: Handshake },
  { label: "Academia", href: "/academia", icon: GraduationCap },
  { label: "Eventos", href: "/eventos", icon: CalendarDays },
  { label: "Benefícios", href: "/beneficios", icon: Gift },
  { label: "Ranking", href: "/ranking", icon: Trophy },
  { label: "SAC", href: "/sac", icon: Phone },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // Ctrl+K shortcut
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
        <nav className="hidden items-center gap-1 lg:flex">
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

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="outline" size="sm" onClick={() => setSearchOpen(true)} className="gap-2 text-muted-foreground">
            <Search className="h-4 w-4" /> Buscar...
            <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin"><LayoutDashboard className="mr-1 h-4 w-4" /> Admin</Link>
            </Button>
          )}
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/perfil"><Building2 className="mr-1 h-4 w-4" /> Meu Perfil</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-1 h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/cadastro">Cadastrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 lg:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
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
            className="overflow-hidden border-t border-border bg-card lg:hidden"
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
                      <Link to="/cadastro" onClick={() => setMobileOpen(false)}>Cadastrar</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>Entrar</Link>
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
  );
}
