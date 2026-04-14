import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, ArrowUpRight } from "lucide-react";
import { getUpgradeWhatsAppUrl } from "@/lib/plans";

interface PlanUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: "produtos" | "oportunidades" | "benefícios";
  currentLimit: number;
}

export default function PlanUpgradeModal({ open, onOpenChange, resourceType, currentLimit }: PlanUpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Crown className="h-7 w-7 text-amber-600" />
          </div>
          <DialogTitle className="text-xl">Limite atingido</DialogTitle>
          <DialogDescription className="text-base">
            Você atingiu o limite de <strong>{currentLimit} {resourceType}</strong> do plano Associado.
            Faça upgrade para o plano Premium e cadastre até{" "}
            {resourceType === "benefícios" ? "benefícios ilimitados" : `10 ${resourceType}`}.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-3">
          <Button className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white" size="lg" asChild>
            <a href={getUpgradeWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
              <Crown className="h-4 w-4" /> Quero ser Premium <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => onOpenChange(false)}>
            Agora não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
