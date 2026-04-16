import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import MobileCTABar from "./MobileCTABar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
      <MobileCTABar />
    </div>
  );
}
