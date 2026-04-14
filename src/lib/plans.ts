// QBCAMP WhatsApp number - change this to update across the platform
export const QBCAMP_WHATSAPP = "5541999999999";

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
    benefits: Infinity,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanType] || PLAN_LIMITS.basic;
}

export function getUpgradeWhatsAppUrl() {
  const message = encodeURIComponent(
    "Olá QBCAMP! Tenho interesse em fazer upgrade para o plano Premium do Conecta+. Podem me passar as informações?"
  );
  return `https://wa.me/${QBCAMP_WHATSAPP}?text=${message}`;
}
