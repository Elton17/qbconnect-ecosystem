import { MessageCircle } from "lucide-react";
import { QBCAMP_WHATSAPP } from "@/lib/constants";

export default function WhatsAppFloatingButton() {
  const message = encodeURIComponent(
    "Olá! Gostaria de mais informações sobre a QBCAMP Conecta+."
  );
  const url = `https://wa.me/${QBCAMP_WHATSAPP}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1da851] hover:scale-110 transition-all duration-300 hover:shadow-xl"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
