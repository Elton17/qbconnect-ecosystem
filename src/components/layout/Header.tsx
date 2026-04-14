import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, Handshake, LayoutDashboard, GraduationCap, Trophy, Gift, LogOut, Building2, Briefcase, CalendarDays, Search, Phone, Crown, Link2, Bell, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlobalSearch from "./GlobalSearch";
import { QBCAMP_PHONE_DISPLAY, QBCAMP_HOURS, QBCAMP_REGION } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Oportunidades", href: "/oportunidades" },
  { label: "Academia", href: "/academia" },
  { label: "Eventos", href: "/eventos" },
  { label: "Benefícios", href: "/beneficios" },
  { label: "Ranking", href: "/ranking" },
  { label: "Planos", href: "/planos" },
];

const mobileNavItems = [
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Oportunidades", href: "/oportunidades", icon: Handshake },
  { label: "Academia", href: "/academia", icon: GraduationCap },
  { label: "Eventos", href: "/eventos", icon: CalendarDays },
  { label: "Benefícios", href: "/beneficios", icon: Gift },
  { label: "Ranking", href: "/ranking", icon: Trophy },
  { label: "Planos", href: "/planos", icon: Crown },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary-dark text-white text-sm hidden md:block">
        <div className="container flex items-center justify-center gap-4 h-9">
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            {QBCAMP_PHONE_DISPLAY}
          </span>
          <span className="text-white/40">·</span>
          <span>{QBCAMP_HOURS}</span>
          <span className="text-white/40">·</span>
          <span>{QBCAMP_REGION}</span>
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
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 text-sm font-bold transition-colors rounded-md text-primary ${
                  location.pathname === "/admin" ? "bg-primary/5" : "hover:bg-primary/5"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)} className="gap-2 text-muted-foreground">
              <Search className="h-4 w-4" /> Buscar...
              <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </Button>
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground relative">
                  <Bell className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <Building2 className="mr-2 h-4 w-4" /> Minha Empresa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/perfil")}>
                      <User className="mr-2 h-4 w-4" /> Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/instrutor/dashboard")}>
                      <GraduationCap className="mr-2 h-4 w-4" /> Painel Instrutor
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="h-9 w-9 text-foreground">
              <Search className="h-4 w-4" />
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
                    <Button variant="ghost" size="sm" asChild className="justify-start text-primary font-bold">
                      <Link to="/admin" onClick={() => setMobileOpen(false)}>
                        <LayoutDashboard className="mr-1 h-4 w-4" /> Admin
                      </Link>
                    </Button>
                  )}
                  {user ? (
                    <>
                      <Button variant="ghost" size="sm" asChild className="justify-start">
                        <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                          <Building2 className="mr-1 h-4 w-4" /> Minha Empresa
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="justify-start">
                        <Link to="/perfil" onClick={() => setMobileOpen(false)}>
                          <User className="mr-1 h-4 w-4" /> Meu Perfil
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
