// QBCAMP Global Constants — change here to update across the platform

export const QBCAMP_WHATSAPP = "5541999999999"; // Substituir pelo número real
export const QBCAMP_PHONE = "+554136721041";
export const QBCAMP_PHONE_DISPLAY = "(41) 3672-1041";
export const QBCAMP_NAME = "QBCAMP Conecta+";
export const QBCAMP_REGION = "Quatro Barras & Campina Grande do Sul";
export const QBCAMP_HOURS = "Seg-Sex 08h às 17h";

export const PLAN_LIMITS = {
  basic: {
    label: "Associado",
    products: 3,
    opportunities: 2,
    benefits: 2,
  },
  premium: {
    label: "Premium",
    products: 10,
    opportunities: 10,
    benefits: 999,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanType] || PLAN_LIMITS.basic;
}

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${QBCAMP_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppContactUrl(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

export function getUpgradeWhatsAppUrl() {
  return getWhatsAppUrl(
    "Olá QBCAMP! Tenho interesse em fazer upgrade para o plano Premium do Conecta+. Podem me passar as informações?"
  );
}
