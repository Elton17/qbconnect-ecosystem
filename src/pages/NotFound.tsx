import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <span className="text-4xl font-extrabold text-primary">404</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Página não encontrada</h1>
        <p className="mb-8 text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/"><Home className="mr-1 h-4 w-4" /> Página Inicial</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
