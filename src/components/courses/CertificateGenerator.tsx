import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Award, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface CertificateGeneratorProps {
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
}

export default function CertificateGenerator({
  courseId,
  courseTitle,
  userId,
  userName,
}: CertificateGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const { toast } = useToast();

  const checkExisting = async () => {
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .maybeSingle();
    return data;
  };

  const generatePDF = (studentName: string, course: string, date: string, code: string) => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, w, h, "F");

    // Border
    doc.setDrawColor(180, 40, 40);
    doc.setLineWidth(2);
    doc.rect(12, 12, w - 24, h - 24);
    doc.setDrawColor(200, 170, 110);
    doc.setLineWidth(0.5);
    doc.rect(16, 16, w - 32, h - 32);

    // Top ornament line
    doc.setDrawColor(180, 40, 40);
    doc.setLineWidth(1);
    doc.line(40, 35, w - 40, 35);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(200, 170, 110);
    doc.text("CERTIFICADO DE CONCLUSÃO", w / 2, 50, { align: "center" });

    // Award icon text
    doc.setFontSize(40);
    doc.setTextColor(180, 40, 40);
    doc.text("★", w / 2, 72, { align: "center" });

    // Certificamos que
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(180, 180, 180);
    doc.text("Certificamos que", w / 2, 88, { align: "center" });

    // Student name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text(studentName, w / 2, 105, { align: "center" });

    // Underline
    const nameWidth = doc.getTextWidth(studentName);
    doc.setDrawColor(180, 40, 40);
    doc.setLineWidth(0.8);
    doc.line(w / 2 - nameWidth / 2, 108, w / 2 + nameWidth / 2, 108);

    // Completed text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(180, 180, 180);
    doc.text("concluiu com êxito o curso", w / 2, 120, { align: "center" });

    // Course title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(200, 170, 110);
    doc.text(course, w / 2, 135, { align: "center", maxWidth: w - 80 });

    // Bottom line
    doc.setDrawColor(180, 40, 40);
    doc.setLineWidth(1);
    doc.line(40, 155, w - 40, 155);

    // Date and code
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Data de conclusão: ${date}`, w / 2 - 60, 168);
    doc.text(`Código: ${code}`, w / 2 + 20, 168);

    // Platform
    doc.setFontSize(9);
    doc.setTextColor(180, 40, 40);
    doc.text("QBCAMP Conecta+ | Academia", w / 2, 182, { align: "center" });

    return doc;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      let cert = await checkExisting();

      if (!cert) {
        const { data, error } = await supabase
          .from("certificates")
          .insert({ course_id: courseId, user_id: userId })
          .select()
          .single();
        if (error) throw error;
        cert = data;
      }

      setCertificate(cert);

      const date = new Date(cert.issued_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const doc = generatePDF(userName, courseTitle, date, cert.certificate_code);
      doc.save(`certificado-${courseTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`);

      toast({ title: "Certificado gerado!", description: "O download do PDF foi iniciado." });
    } catch (err: any) {
      toast({ title: "Erro ao gerar certificado", description: err.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Award className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Parabéns! 🎉</p>
          <p className="text-xs text-muted-foreground">Você concluiu 100% do curso</p>
        </div>
      </div>
      <Button onClick={handleGenerate} disabled={generating} className="w-full">
        {generating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {certificate ? "Baixar Certificado Novamente" : "Gerar Certificado PDF"}
      </Button>
    </div>
  );
}
