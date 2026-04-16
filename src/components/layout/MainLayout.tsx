import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import MobileCTABar from "./MobileCTABar";
import { useAuth } from "@/contexts/AuthContext";

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`flex-1 ${!user ? "pb-16 lg:pb-0" : ""}`}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
      <MobileCTABar />
    </div>
  );
}
