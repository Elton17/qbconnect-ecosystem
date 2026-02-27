import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const REGISTRATION_FIELDS: readonly { key: string; label: string; alwaysRequired?: boolean }[] = [
  { key: "nome", label: "Nome completo", alwaysRequired: true },
  { key: "cpf", label: "CPF" },
  { key: "empresa", label: "Empresa" },
  { key: "cnpj", label: "CNPJ" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "cargo", label: "Cargo" },
] as const;

export type RegistrationFieldKey = "nome" | "cpf" | "empresa" | "cnpj" | "whatsapp" | "email" | "cargo";

interface Props {
  selected: RegistrationFieldKey[];
  onChange: (fields: RegistrationFieldKey[]) => void;
}

export default function RegistrationFieldsConfig({ selected, onChange }: Props) {
  const toggle = (key: RegistrationFieldKey) => {
    const field = REGISTRATION_FIELDS.find(f => f.key === key);
    if (field?.alwaysRequired) return;
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div>
      <Label className="mb-2 block">Campos obrigatórios para inscrição</Label>
      <div className="grid grid-cols-2 gap-2">
        {REGISTRATION_FIELDS.map((field) => (
          <label
            key={field.key}
            className="flex items-center gap-2 rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm cursor-pointer hover:bg-muted/60 transition-colors"
          >
            <Checkbox
              checked={selected.includes(field.key as RegistrationFieldKey)}
              onCheckedChange={() => toggle(field.key as RegistrationFieldKey)}
              disabled={field.alwaysRequired}
            />
            <span className="text-foreground">{field.label}</span>
            {field.alwaysRequired && (
              <span className="text-[10px] text-muted-foreground">(obrigatório)</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
