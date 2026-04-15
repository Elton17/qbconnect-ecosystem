import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
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
import EventOrganizerPage from "@/pages/EventOrganizerPage";
import CourseDetailPage from "@/pages/CourseDetailPage";
import CourseManagePage from "@/pages/CourseManagePage";
import InstructorDashboardPage from "@/pages/InstructorDashboardPage";
import CertificateVerifyPage from "@/pages/CertificateVerifyPage";
import CompanyDashboardPage from "@/pages/CompanyDashboardPage";
import LearningPathPage from "@/pages/LearningPathPage";
import SACPage from "@/pages/SACPage";
import MeusCursosPage from "@/pages/MeusCoursosPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

import PreLaunchPage from "@/pages/PreLaunchPage";

const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/servicos" element={<ServicosPage />} />
              <Route path="/produto/:id" element={<ProductDetailPage />} />
              <Route path="/oportunidades" element={<OpportunitiesPage />} />
              <Route path="/academia" element={<AcademyPage />} />
              <Route path="/trilha/:id" element={<LearningPathPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/beneficios" element={<BenefitsPage />} />
              <Route path="/eventos" element={<EventsPage />} />
              <Route path="/evento/:id" element={<EventDetailPage />} />
              <Route path="/curso/:id" element={<CourseDetailPage />} />
              <Route path="/empresa/:id" element={<CompanyProfilePage />} />
              <Route path="/cadastro" element={<CompanyRegistrationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/certificado" element={<CertificateVerifyPage />} />
              <Route path="/certificado/:codigo" element={<CertificateVerifyPage />} />
              <Route path="/sac" element={<SACPage />} />
              

              {/* Protected routes */}
              <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/meus-cursos" element={<ProtectedRoute><MeusCursosPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><CompanyDashboardPage /></ProtectedRoute>} />
              <Route path="/curso/:id/gerenciar" element={<ProtectedRoute><CourseManagePage /></ProtectedRoute>} />
              <Route path="/instrutor/dashboard" element={<ProtectedRoute><InstructorDashboardPage /></ProtectedRoute>} />
              <Route path="/evento/:id/painel" element={<ProtectedRoute><EventOrganizerPage /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>} />
            </Route>
            <Route path="/em-breve" element={<PreLaunchPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
