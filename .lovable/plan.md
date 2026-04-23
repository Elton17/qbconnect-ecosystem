

## Configurar remetente com domínio QBCAMP

Configurar um remetente profissional usando o domínio `qbcamp.com.br` para que os e-mails da plataforma (confirmação de cadastro, recuperação de senha, etc.) sejam enviados de algo como `nao-responda@qbcamp.com.br` em vez do remetente padrão do Lovable.

### Benefícios
- E-mails com cara profissional, com o domínio da QBCAMP
- Menor chance de cair em spam (autenticação SPF/DKIM/DMARC do próprio domínio)
- Maior confiança dos associados ao receber comunicações

### Etapas

**1. Configurar o domínio de e-mail**

Vou abrir o assistente de configuração de e-mail dentro do Lovable. Você vai escolher um subdomínio para envio (recomendado: `mail.qbcamp.com.br` ou `email.qbcamp.com.br` — não usar o domínio raiz para preservar e-mails existentes).

O assistente gera automaticamente os registros DNS necessários (SPF, DKIM, DMARC e MX para bounces).

**2. Adicionar os registros DNS no provedor do domínio**

Você (ou quem administra o DNS de `qbcamp.com.br`) precisa colar os registros gerados no painel do provedor (Registro.br, Cloudflare, GoDaddy, etc.). A propagação leva de minutos a algumas horas.

**3. Personalizar os templates dos e-mails de autenticação**

Após o domínio estar configurado, vou:
- Criar templates customizados para os 6 tipos de e-mails de autenticação (cadastro, recuperação de senha, magic link, convite, troca de e-mail, reautenticação)
- Aplicar a identidade visual do Conecta Mais: vermelho `#C81E1E`, preto `#1A1A1A`, fontes Montserrat e Inter
- Incluir o logo da QBCAMP no topo de cada e-mail
- Traduzir todo o conteúdo para português brasileiro
- Usar o tom da marca ("QBCAMP Conecta Mais", "Olá!", etc.)

**4. Ativar o envio**

Os e-mails de autenticação passarão a sair automaticamente do remetente do domínio QBCAMP assim que o DNS for verificado. Até lá, a plataforma continua usando o remetente padrão sem interrupção.

### Detalhes técnicos

- Edge Function `auth-email-hook` será criada em `supabase/functions/auth-email-hook/` para processar eventos de autenticação
- Templates React Email em `supabase/functions/_shared/email-templates/*.tsx`
- O logo será carregado de `public/` (ou subido para um bucket `email-assets` se necessário)
- Nenhuma configuração de Resend, SendGrid ou chave de API externa é necessária — tudo é gerenciado pelo Lovable Cloud

### Importante
- Você precisa ter permissão de **admin/owner do workspace Lovable** para configurar o domínio
- Você precisa ter acesso ao **painel DNS** de `qbcamp.com.br` para adicionar os registros
- E-mails **não-de-autenticação** (notificações de aprovação, novas oportunidades, certificados, etc.) podem ser implementados em uma etapa seguinte usando a mesma infraestrutura

