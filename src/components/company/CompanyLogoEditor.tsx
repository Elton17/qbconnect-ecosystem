import { useRef, useState } from "react";
import { Building2, Camera, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { optimizeCompanyLogo, validateCompanyLogo } from "@/lib/company-logo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CompanyLogoEditorProps {
  ownerId: string;
  value?: string | null;
  onChange: (url: string | null) => Promise<void> | void;
  disabled?: boolean;
  compact?: boolean;
}

export default function CompanyLogoEditor({ ownerId, value, onChange, disabled, compact }: CompanyLogoEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file?: File) {
    if (!file) return;
    const validationError = validateCompanyLogo(file);
    if (validationError) { toast.error(validationError); return; }
    setUploading(true);
    try {
      const optimized = await optimizeCompanyLogo(file);
      const path = `${ownerId}/logo.webp`;
      const { error } = await supabase.storage.from("logos").upload(path, optimized, { upsert: true, contentType: "image/webp" });
      if (error) throw error;
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      await onChange(`${data.publicUrl}?v=${Date.now()}`);
      toast.success("Logo atualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a logo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    setUploading(true);
    try {
      const { error } = await supabase.storage.from("logos").remove([`${ownerId}/logo.webp`]);
      if (error) throw error;
      await onChange(null);
      toast.success("Logo removida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover a logo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={compact ? "flex items-center gap-4" : "space-y-3"}>
      <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background p-2">
        {value ? <img src={value} alt="Logo da empresa" className="h-full w-full object-contain" /> : <Building2 className="h-10 w-10 text-muted-foreground" />}
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} disabled={disabled || uploading} />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={disabled || uploading}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
          {value ? "Substituir logo" : "Anexar logo"}
        </Button>
        {value && <Button type="button" variant="destructive" size="icon" onClick={() => void remove()} disabled={disabled || uploading} title="Remover logo"><Trash2 className="h-4 w-4" /></Button>}
      </div>
      {!compact && <p className="text-xs text-muted-foreground">JPG, PNG ou WebP, até 2 MB. A imagem será ajustada automaticamente.</p>}
    </div>
  );
}