import { motion } from "framer-motion";
import { Download, Smartphone, Wifi, WifiOff, Share2, MoreVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    if (isStandalone) setIsInstalled(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const steps = isIOS
    ? [
        { icon: Share2, text: 'Toque no botão "Compartilhar" na barra do Safari' },
        { icon: Download, text: '"Adicionar à Tela de Início"' },
        { icon: Check, text: "Confirme e pronto! O app aparecerá na sua tela" },
      ]
    : [
        { icon: MoreVertical, text: "Toque no menu do navegador (⋮)" },
        { icon: Download, text: '"Instalar aplicativo" ou "Adicionar à tela inicial"' },
        { icon: Check, text: "Confirme e pronto!" },
      ];

  return (
    <div>
      <section className="relative overflow-hidden bg-secondary py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-10 top-1/4 h-72 w-72 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 h-64 w-64 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-2xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-1.5 text-sm text-secondary-foreground/80">
              <Smartphone className="h-4 w-4" /> App Mobile
            </div>

            {isInstalled ? (
              <>
                <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl">
                  App <span className="text-gradient">Instalado!</span>
                </h1>
                <p className="text-lg text-secondary-foreground/70">
                  O QBCAMP Conecta+ já está na sua tela inicial. Aproveite!
                </p>
              </>
            ) : (
              <>
                <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-secondary-foreground md:text-5xl">
                  Instale o <span className="text-gradient">QBCAMP</span>
                </h1>
                <p className="mb-8 text-lg text-secondary-foreground/70">
                  Tenha o QBCAMP Conecta+ direto no seu celular, como um app nativo. Acesso rápido, funciona offline e sem ocupar espaço.
                </p>

                {deferredPrompt ? (
                  <Button variant="hero" size="xl" onClick={handleInstall}>
                    <Download className="mr-1.5 h-5 w-5" /> Instalar agora
                  </Button>
                ) : (
                  <div className="mx-auto max-w-md space-y-4">
                    <p className="text-sm font-medium text-secondary-foreground/60">
                      {isIOS ? "No iPhone/iPad, siga estes passos:" : "No seu celular, siga estes passos:"}
                    </p>
                    {steps.map((step, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center gap-4 rounded-xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-4 text-left">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                          <step.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-primary">Passo {i + 1}</span>
                          <p className="text-sm text-secondary-foreground">{step.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mx-auto mt-12 grid max-w-lg gap-4 sm:grid-cols-3">
            {[
              { icon: Smartphone, title: "Como um App", desc: "Ícone na tela inicial" },
              { icon: WifiOff, title: "Funciona Offline", desc: "Acesse sem internet" },
              { icon: Wifi, title: "Sempre Atualizado", desc: "Updates automáticos" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-4 text-center backdrop-blur-sm">
                <item.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                <h3 className="text-sm font-bold text-secondary-foreground">{item.title}</h3>
                <p className="mt-0.5 text-xs text-secondary-foreground/60">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
