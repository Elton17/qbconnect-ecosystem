import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileCTABar() {
  const { user } = useAuth();

  if (user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-sm p-3 lg:hidden">
      <Button
        size="lg"
        asChild
        className="w-full bg-accent text-accent-foreground hover:brightness-110 font-heading font-bold shadow-md animate-pulse-subtle"
      >
        <Link to="/cadastro">
          <Crown className="mr-2 h-5 w-5" />
          Cadastre sua Empresa
        </Link>
      </Button>
    </div>
  );
}
