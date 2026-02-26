import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, Upload, User, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const segments = [
  "Alimentação",
  "Automotivo",
  "Beleza e Estética",
  "Comércio Varejista",
  "Construção Civil",
  "Consultoria",
  "Educação",
  "Indústria",
  "Logística",
  "Saúde",
  "Serviços Gerais",
  "Tecnologia",
  "Outro",
];

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

const formSchema = z.object({
  companyName: z.string().trim().min(2, "Nome da empresa é obrigatório").max(120),
  cnpj: z.string().regex(cnpjRegex, "CNPJ inválido (XX.XXX.XXX/XXXX-XX)"),
  segment: z.string().min(1, "Selecione um segmento"),
  city: z.string().min(1, "Selecione uma cidade"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  phone: z.string().min(8, "Telefone inválido").max(20),
  email: z.string().email("E-mail inválido").max(255),
  description: z.string().trim().min(10, "Mínimo 10 caracteres").max(1000),
  address: z.string().trim().min(5, "Endereço é obrigatório").max(200),
  plan: z.enum(["basic", "premium"], { required_error: "Selecione um plano" }),
  contactName: z.string().trim().min(2, "Nome do responsável é obrigatório").max(100),
  contactRole: z.string().trim().min(2, "Cargo é obrigatório").max(100),
  contactEmail: z.string().email("E-mail inválido").max(255),
  contactPhone: z.string().min(8, "Telefone inválido").max(20),
});

type FormData = z.infer<typeof formSchema>;

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default function CompanyRegistrationPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { plan: "basic" },
  });

  const selectedPlan = watch("plan");

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Registration data:", data);
    toast({
      title: "Cadastro enviado com sucesso!",
      description: "Sua empresa será analisada e aprovada em breve.",
    });
    setTimeout(() => navigate("/"), 2000);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="py-12">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="mb-3 text-3xl font-extrabold text-foreground md:text-4xl">
            Cadastre sua <span className="text-primary">Empresa</span>
          </h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para associar sua empresa ao ecossistema QBCAMP Conecta+.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Company Info */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" /> Dados da Empresa
                </CardTitle>
                <CardDescription>Informações básicas sobre sua empresa.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="companyName">Nome da Empresa *</Label>
                  <Input id="companyName" placeholder="Razão social" {...register("companyName")} />
                  {errors.companyName && <p className="mt-1 text-xs text-destructive">{errors.companyName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    {...register("cnpj")}
                    onChange={(e) => {
                      const formatted = formatCNPJ(e.target.value);
                      setValue("cnpj", formatted, { shouldValidate: true });
                    }}
                  />
                  {errors.cnpj && <p className="mt-1 text-xs text-destructive">{errors.cnpj.message}</p>}
                </div>
                <div>
                  <Label htmlFor="segment">Segmento *</Label>
                  <Select onValueChange={(v) => setValue("segment", v, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.segment && <p className="mt-1 text-xs text-destructive">{errors.segment.message}</p>}
                </div>
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Select onValueChange={(v) => setValue("city", v, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quatro Barras">Quatro Barras</SelectItem>
                      <SelectItem value="Campina Grande do Sul">Campina Grande do Sul</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input id="phone" placeholder="(41) 99999-0000" {...register("phone")} />
                  {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" type="email" placeholder="contato@empresa.com" {...register("email")} />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://..." {...register("website")} />
                  {errors.website && <p className="mt-1 text-xs text-destructive">{errors.website.message}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-5 w-5 text-primary" /> Perfil
                </CardTitle>
                <CardDescription>Logo, descrição e endereço.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Logo da Empresa</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="h-20 w-20 rounded-xl border border-border object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <Input type="file" accept="image/*" onChange={onLogoChange} className="max-w-xs" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea id="description" placeholder="Conte sobre sua empresa..." rows={4} {...register("description")} />
                  {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
                </div>
                <div>
                  <Label htmlFor="address">Endereço *</Label>
                  <Input id="address" placeholder="Rua, número, bairro" {...register("address")} />
                  {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Plan */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" /> Plano
                </CardTitle>
                <CardDescription>Escolha o plano ideal para sua empresa.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue="basic"
                  onValueChange={(v) => setValue("plan", v as "basic" | "premium", { shouldValidate: true })}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <label
                    className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${
                      selectedPlan === "basic"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="basic" id="basic" className="mt-1" />
                      <div>
                        <p className="font-bold text-foreground">Básico</p>
                        <p className="text-sm text-muted-foreground">Gratuito</p>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Perfil empresarial</li>
                          <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Marketplace básico</li>
                          <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Até 5 produtos</li>
                        </ul>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${
                      selectedPlan === "premium"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="premium" id="premium" className="mt-1" />
                      <div>
                        <p className="font-bold text-foreground">Premium</p>
                        <p className="text-sm text-primary font-semibold">R$ 99/mês</p>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Tudo do básico</li>
                          <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Produtos ilimitados</li>
                          <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Destaque no ranking</li>
                          <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Acesso à Academia</li>
                        </ul>
                      </div>
                    </div>
                  </label>
                </RadioGroup>
                {errors.plan && <p className="mt-2 text-xs text-destructive">{errors.plan.message}</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* Responsible Person */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" /> Responsável
                </CardTitle>
                <CardDescription>Dados da pessoa de contato.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contactName">Nome *</Label>
                  <Input id="contactName" placeholder="Nome completo" {...register("contactName")} />
                  {errors.contactName && <p className="mt-1 text-xs text-destructive">{errors.contactName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="contactRole">Cargo *</Label>
                  <Input id="contactRole" placeholder="Ex: Diretor, Gerente" {...register("contactRole")} />
                  {errors.contactRole && <p className="mt-1 text-xs text-destructive">{errors.contactRole.message}</p>}
                </div>
                <div>
                  <Label htmlFor="contactEmail">E-mail *</Label>
                  <Input id="contactEmail" type="email" placeholder="email@pessoal.com" {...register("contactEmail")} />
                  {errors.contactEmail && <p className="mt-1 text-xs text-destructive">{errors.contactEmail.message}</p>}
                </div>
                <div>
                  <Label htmlFor="contactPhone">Telefone *</Label>
                  <Input id="contactPhone" placeholder="(41) 99999-0000" {...register("contactPhone")} />
                  {errors.contactPhone && <p className="mt-1 text-xs text-destructive">{errors.contactPhone.message}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeIn} className="flex justify-center">
            <Button type="submit" size="xl" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Enviando..." : "Cadastrar Empresa"}
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
