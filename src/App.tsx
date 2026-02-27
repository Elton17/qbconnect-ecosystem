import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import LandingPage from "@/pages/LandingPage";
import MarketplacePage from "@/pages/MarketplacePage";
import ServicosPage from "@/pages/ServicosPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import OpportunitiesPage from "@/pages/OpportunitiesPage";
import AcademyPage from "@/pages/AcademyPage";
import RankingPage from "@/pages/RankingPage";
import BenefitsPage from "@/pages/BenefitsPage";
import AdminPage from "@/pages/AdminPage";
import CompanyRegistrationPage from "@/pages/CompanyRegistrationPage";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import CompanyProfilePage from "@/pages/CompanyProfilePage";
import NotFound from "@/pages/NotFound";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/servicos" element={<ServicosPage />} />
              <Route path="/produto/:id" element={<ProductDetailPage />} />
              <Route path="/oportunidades" element={<OpportunitiesPage />} />
              <Route path="/academia" element={<AcademyPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/beneficios" element={<BenefitsPage />} />
              <Route path="/eventos" element={<EventsPage />} />
              <Route path="/evento/:id" element={<EventDetailPage />} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>} />
              <Route path="/cadastro" element={<CompanyRegistrationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/empresa/:id" element={<CompanyProfilePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
