import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react";

interface ParsedContact {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  whatsapp: string;
  notes: string;
  valid: boolean;
  error?: string;
}

const EXPECTED_HEADERS = ["nome", "cargo", "departamento", "email", "telefone", "whatsapp", "observacoes"];

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === "," || ch === ";") { row.push(current.trim()); current = ""; }
      else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        if (ch === "\r") i++;
        row.push(current.trim());
        if (row.some(c => c)) rows.push(row);
        row = []; current = "";
      } else current += ch;
    }
  }
  row.push(current.trim());
  if (row.some(c => c)) rows.push(row);
  return rows;
}

function mapRow(cells: string[]): ParsedContact {
  const name = (cells[0] || "").trim();
  return {
    name,
    role: (cells[1] || "").trim(),
    department: (cells[2] || "").trim(),
    email: (cells[3] || "").trim(),
    phone: (cells[4] || "").trim(),
    whatsapp: (cells[5] || "").trim(),
    notes: (cells[6] || "").trim(),
    valid: name.length > 0,
    error: name.length === 0 ? "Nome obrigatório" : undefined,
  };
}

interface Props {
  userId: string;
  onImported: () => void;
}

export default function CsvContactImport({ userId, onImported }: Props) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [parsed, setParsed] = useState<ParsedContact[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        toast({ title: "Arquivo vazio", description: "O CSV precisa ter ao menos uma linha de dados além do cabeçalho.", variant: "destructive" });
        return;
      }
      const dataRows = rows.slice(1);
      setParsed(dataRows.map(mapRow));
      setOpen(true);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const validCount = parsed.filter(p => p.valid).length;

  const handleImport = async () => {
    const toInsert = parsed.filter(p => p.valid).map(p => ({
      user_id: userId,
      name: p.name.slice(0, 100),
      role: p.role.slice(0, 100),
      department: p.department.slice(0, 100),
      email: p.email.slice(0, 255),
      phone: p.phone.slice(0, 30),
      whatsapp: p.whatsapp.slice(0, 30),
      notes: p.notes.slice(0, 500),
      is_primary: false,
    }));
    if (!toInsert.length) return;
    setImporting(true);
    const { error } = await supabase.from("company_contacts").insert(toInsert);
    setImporting(false);
    if (error) {
      toast({ title: "Erro na importação", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${toInsert.length} contato(s) importado(s) com sucesso!` });
      setOpen(false);
      setParsed([]);
      onImported();
    }
  };

  const downloadTemplate = () => {
    const bom = "\uFEFF";
    const csv = bom + EXPECTED_HEADERS.join(";") + "\nJoão Silva;Diretor;Comercial;joao@empresa.com;(41)3333-4444;5541999999999;Contato principal";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "modelo_contatos.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="mr-1.5 h-4 w-4" /> Importar CSV
        </Button>
        <Button variant="ghost" size="sm" onClick={downloadTemplate}>
          <Download className="mr-1.5 h-4 w-4" /> Modelo
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" /> Pré-visualização da Importação
            </DialogTitle>
            <DialogDescription>
              {parsed.length} linha(s) encontrada(s) — {validCount} válida(s)
              {parsed.length - validCount > 0 && (
                <span className="text-destructive"> · {parsed.length - validCount} com erro</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Depto</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.map((p, i) => (
                  <TableRow key={i} className={!p.valid ? "bg-destructive/5" : ""}>
                    <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                    <TableCell className="font-medium">{p.name || "—"}</TableCell>
                    <TableCell className="text-sm">{p.role || "—"}</TableCell>
                    <TableCell className="text-sm">{p.department || "—"}</TableCell>
                    <TableCell className="text-sm">{p.email || "—"}</TableCell>
                    <TableCell className="text-sm">{p.phone || "—"}</TableCell>
                    <TableCell>
                      {p.valid ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> OK
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="mr-1 h-3 w-3" /> {p.error}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleImport} disabled={importing || validCount === 0}>
              {importing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Importar {validCount} contato(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
