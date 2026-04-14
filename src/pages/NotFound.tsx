import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ShoppingBag } from "lucide-react";

const NotFound = () => {
  useEffect(() => {
    document.title = "404 · QBCAMP Conecta+";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="text-center max-w-md px-4">
        <p className="font-heading text-[120px] font-black leading-none text-primary md:text-[160px]">
          404
        </p>
        <h1 className="mt-4 text-2xl font-heading font-bold text-white md:text-3xl">
          Página não encontrada
        </h1>
        <p className="mt-3 text-white/60">
          Essa página não existe ou foi removida.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-primary text-white hover:bg-primary-dark font-heading font-bold">
            <Link to="/"><Home className="mr-1.5 h-4 w-4" /> Voltar para o início</Link>
          </Button>
          <Button variant="outline" asChild className="border-white/30 text-white hover:border-white hover:bg-white/10">
            <Link to="/marketplace"><ShoppingBag className="mr-1.5 h-4 w-4" /> Ver Marketplace</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
