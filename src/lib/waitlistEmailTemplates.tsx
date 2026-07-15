// Templates de e-mail de confirmação do pré-cadastro (Waitlist)
// Renderizados também no preview /admin/email-preview

export interface WaitlistEmailData {
  company_name: string;
  contact_name: string;
  cnpj: string;
  whatsapp: string;
  segment: string;
}

const BRAND = {
  primary: "#C81E1E",
  dark: "#1A1A1A",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F9FAFB",
};

const wrap = (title: string, preview: string, body: string) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${BRAND.dark};">
<span style="display:none;opacity:0;visibility:hidden;height:0;width:0;overflow:hidden;">${preview}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${BRAND.border};">
      <tr><td style="background:${BRAND.dark};padding:22px 28px;">
        <div style="font-weight:900;font-size:20px;letter-spacing:.2px;">
          <span style="color:#fff;">QBCAMP</span>
          <span style="color:${BRAND.primary};margin:0 4px;">●</span>
          <span style="color:${BRAND.primary};">Conecta+</span>
        </div>
      </td></tr>
      <tr><td style="padding:32px 28px 8px 28px;">
        ${body}
      </td></tr>
      <tr><td style="padding:24px 28px 28px 28px;border-top:1px solid ${BRAND.border};color:${BRAND.muted};font-size:12px;line-height:1.6;">
        © 2026 QBCAMP · Associação Industrial e Comercial de Quatro Barras e Campina Grande do Sul<br/>
        Você recebeu este e-mail porque fez um pré-cadastro no QBCAMP Conecta+.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

const summaryBlock = (d: WaitlistEmailData) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:10px;margin:20px 0;">
  <tr><td style="padding:16px 18px;font-size:14px;color:${BRAND.dark};">
    <div style="font-weight:700;margin-bottom:8px;color:${BRAND.dark};">Resumo do seu cadastro</div>
    <div style="color:${BRAND.muted};line-height:1.9;">
      <strong style="color:${BRAND.dark};">Empresa:</strong> ${d.company_name}<br/>
      <strong style="color:${BRAND.dark};">CNPJ:</strong> ${d.cnpj}<br/>
      <strong style="color:${BRAND.dark};">Responsável:</strong> ${d.contact_name}<br/>
      <strong style="color:${BRAND.dark};">WhatsApp:</strong> ${d.whatsapp}<br/>
      <strong style="color:${BRAND.dark};">Segmento:</strong> ${d.segment}
    </div>
  </td></tr>
</table>`;

export function renderAssociateEmail(d: WaitlistEmailData): { subject: string; html: string } {
  const subject = `${d.company_name}, seu acesso antecipado ao QBCAMP Conecta+ está garantido ✅`;
  const html = wrap(
    subject,
    "Você é associada QBCAMP — acesso antecipado garantido no Conecta+.",
    `
    <div style="display:inline-block;background:#ECFDF5;color:#065F46;font-size:12px;font-weight:700;padding:6px 12px;border-radius:999px;margin-bottom:14px;">
      ✓ ASSOCIADA QBCAMP
    </div>
    <h1 style="font-size:24px;line-height:1.3;margin:0 0 12px 0;color:${BRAND.dark};">
      Olá, ${d.contact_name.split(" ")[0]}! Seu pré-cadastro foi confirmado.
    </h1>
    <p style="font-size:15px;line-height:1.6;color:${BRAND.muted};margin:0 0 8px 0;">
      Como <strong style="color:${BRAND.dark};">${d.company_name}</strong> já é associada QBCAMP, você terá <strong style="color:${BRAND.primary};">acesso antecipado</strong> ao Conecta+ assim que a plataforma abrir — sem fila e sem custo adicional.
    </p>
    ${summaryBlock(d)}
    <div style="font-weight:700;margin:18px 0 8px 0;">O que acontece agora</div>
    <ol style="padding-left:20px;color:${BRAND.muted};font-size:14px;line-height:1.8;margin:0 0 20px 0;">
      <li>Nossa equipe entrará em contato pelo WhatsApp com seu convite de acesso.</li>
      <li>Você poderá cadastrar produtos, serviços e oportunidades da sua empresa.</li>
      <li>Aproveite os benefícios exclusivos do Clube QBCAMP dentro da plataforma.</li>
    </ol>
    <a href="https://wa.me/5541991228567" style="display:inline-block;background:${BRAND.primary};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:8px;font-size:14px;">
      Falar com a QBCAMP no WhatsApp
    </a>
    <p style="font-size:13px;color:${BRAND.muted};margin:22px 0 0 0;">
      Dúvidas? Responda este e-mail ou fale conosco: (41) 3672-1041 · Seg-Sex 08h às 17h.
    </p>
    `,
  );
  return { subject, html };
}

export function renderNonAssociateEmail(d: WaitlistEmailData): { subject: string; html: string } {
  const subject = `${d.company_name}, recebemos seu pré-cadastro no QBCAMP Conecta+`;
  const html = wrap(
    subject,
    "Pré-cadastro confirmado. Torne-se associada QBCAMP e garanta acesso antecipado.",
    `
    <div style="display:inline-block;background:#FEF3C7;color:#92400E;font-size:12px;font-weight:700;padding:6px 12px;border-radius:999px;margin-bottom:14px;">
      ● PRÉ-CADASTRO RECEBIDO
    </div>
    <h1 style="font-size:24px;line-height:1.3;margin:0 0 12px 0;color:${BRAND.dark};">
      Olá, ${d.contact_name.split(" ")[0]}! Obrigado por se inscrever.
    </h1>
    <p style="font-size:15px;line-height:1.6;color:${BRAND.muted};margin:0 0 8px 0;">
      Recebemos o pré-cadastro da <strong style="color:${BRAND.dark};">${d.company_name}</strong>. O QBCAMP Conecta+ é uma plataforma <strong>exclusiva para empresas associadas</strong> — para garantir seu acesso na abertura, associe-se agora.
    </p>
    ${summaryBlock(d)}
    <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:16px 18px;margin:18px 0;">
      <div style="font-weight:700;color:${BRAND.primary};margin-bottom:6px;">Torne-se associada QBCAMP</div>
      <div style="font-size:14px;color:${BRAND.dark};line-height:1.6;">
        Ao se filiar, sua empresa ganha acesso antecipado ao Conecta+, participa do Clube de Benefícios, tem visibilidade no marketplace regional e representação institucional.
      </div>
    </div>
    <a href="https://qbcamp.com.br/filiacao" style="display:inline-block;background:${BRAND.primary};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:8px;font-size:14px;">
      Quero me associar à QBCAMP
    </a>
    <a href="https://wa.me/5541991228567" style="display:inline-block;margin-left:10px;color:${BRAND.dark};text-decoration:none;font-weight:600;padding:12px 4px;font-size:14px;">
      Falar no WhatsApp →
    </a>
    <p style="font-size:13px;color:${BRAND.muted};margin:22px 0 0 0;">
      Enquanto isso, você continua na nossa lista e será avisado sobre novidades.
    </p>
    `,
  );
  return { subject, html };
}

export const SAMPLE_WAITLIST_DATA: WaitlistEmailData = {
  company_name: "Metalúrgica Souza Ltda",
  contact_name: "Ana Souza",
  cnpj: "12.345.678/0001-90",
  whatsapp: "(41) 99999-9999",
  segment: "Indústria",
};
