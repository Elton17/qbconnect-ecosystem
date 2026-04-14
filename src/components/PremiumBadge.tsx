import { Crown } from "lucide-react";

export default function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 ${className}`}>
      <Crown className="h-3 w-3" /> Premium
    </span>
  );
}
