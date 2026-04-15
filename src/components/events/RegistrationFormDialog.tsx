import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Ticket } from "lucide-react";
import { REGISTRATION_FIELDS, type RegistrationFieldKey } from "./RegistrationFieldsConfig";
import { formatCPF as maskCPF, formatCNPJ as maskCNPJ, formatPhone as maskPhone } from "@/lib/masks";

export default function RegistrationFormDialog({ open, onOpenChange, requiredFields, eventTitle, onSubmit, submitting }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Always include email for confirmation
  const allRequired = requiredFields.includes("email" as RegistrationFieldKey) ? requiredFields : [...requiredFields, "email" as RegistrationFieldKey];
  const fields = REGISTRATION_FIELDS.filter(f => allRequired.includes(f.key as RegistrationFieldKey));

  const handleChange = (key: string, value: string) => {
    let masked = value;
    if (key === "cpf") masked = maskCPF(value);
    if (key === "cnpj") masked = maskCNPJ(value);
    if (key === "whatsapp") masked = maskPhone(value);
    setFormData(prev => ({ ...prev, [key]: masked }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach(f => {
      if (!formData[f.key]?.trim()) {
        newErrors[f.key] = `${f.label} é obrigatório`;
      }
    });
    if (formData.cpf && formData.cpf.replace(/\D/g, "").length !== 11) {
      newErrors.cpf = "CPF inválido";
    }
    if (formData.cnpj && formData.cnpj.replace(/\D/g, "").length !== 14) {
      newErrors.cnpj = "CNPJ inválido";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(formData);
    setFormData({});
  };

  const getInputType = (key: string) => {
    if (key === "email") return "email";
    if (key === "whatsapp") return "tel";
    return "text";
  };

  const getPlaceholder = (key: string) => {
    const map: Record<string, string> = {
      nome: "Seu nome completo",
      cpf: "000.000.000-00",
      empresa: "Nome da empresa",
      cnpj: "00.000.000/0000-00",
      whatsapp: "(00) 00000-0000",
      email: "seu@email.com",
      cargo: "Seu cargo",
    };
    return map[key] || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" /> Inscrição
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para se inscrever em <strong>{eventTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {fields.map(field => (
            <div key={field.key}>
              <Label className="mb-1 block text-sm">{field.label} *</Label>
              <Input
                type={getInputType(field.key)}
                value={formData[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={getPlaceholder(field.key)}
                maxLength={field.key === "nome" ? 100 : field.key === "empresa" ? 100 : field.key === "cargo" ? 60 : undefined}
              />
              {errors[field.key] && (
                <p className="mt-0.5 text-xs text-destructive">{errors[field.key]}</p>
              )}
            </div>
          ))}
          <Button onClick={handleSubmit} disabled={submitting} className="w-full mt-2">
            {submitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Ticket className="mr-1 h-4 w-4" />}
            Confirmar Inscrição
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
