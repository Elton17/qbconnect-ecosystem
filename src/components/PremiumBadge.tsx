import { Crown } from "lucide-react";

export default function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-premium/30 bg-premium/10 px-2.5 py-0.5 text-xs font-bold text-premium ${className}`}>
      <Crown className="h-3 w-3" /> Premium
    </span>
  );
}