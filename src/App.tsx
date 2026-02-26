import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import LandingPage from "@/pages/LandingPage";
import MarketplacePage from "@/pages/MarketplacePage";
import OpportunitiesPage from "@/pages/OpportunitiesPage";
import AcademyPage from "@/pages/AcademyPage";
import RankingPage from "@/pages/RankingPage";
import BenefitsPage from "@/pages/BenefitsPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/oportunidades" element={<OpportunitiesPage />} />
            <Route path="/academia" element={<AcademyPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/beneficios" element={<BenefitsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
