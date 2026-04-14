import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message, variant: "destructive" });
    } else {
      toast({ title: "Login realizado com sucesso!" });
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-[85vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-secondary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-accent blur-3xl" />
        </div>
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center gap-8 py-12 lg:flex-row lg:gap-16">
        {/* Left side - branding */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="hidden max-w-md text-center lg:block lg:text-left">
          <h1 className="mb-4 text-4xl font-extrabold text-secondary-foreground">
            Bem-vindo de volta ao <span className="text-gradient">QBCAMP Conecta+</span>
          </h1>
          <p className="mb-6 text-lg text-secondary-foreground/70">
            Acesse sua conta para gerenciar seus produtos, oportunidades e benefícios.
          </p>
          <div className="space-y-3">
            {["Marketplace B2B Regional", "Oportunidades de negócio", "Clube de benefícios exclusivos"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-secondary-foreground/80">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20"><ArrowRight className="h-3 w-3 text-primary" /></div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side - form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Card className="card-shadow border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <LogIn className="h-7 w-7 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-extrabold">Entrar</CardTitle>
              <CardDescription>Acesse sua conta empresarial</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="seu@email.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <Link to="/esqueci-senha" className="text-sm font-medium text-primary hover:underline">
                  Esqueci minha senha
                </Link>
                <p className="text-center text-sm text-muted-foreground">
                  Não tem conta?{" "}
                  <a href="https://qbcamp.com.br/filiacao" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Cadastre sua empresa</a>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
