# Manter meu acesso admin sempre logado

Sua conta `elton.lunardon@gmail.com` já tem o papel **admin** no banco — o problema é apenas a sessão do navegador expirando (último acesso registrado: 24/06). Ninguém, nem eu, consegue "criar" um login dentro do seu navegador; o que dá para fazer é deixar a sessão durar praticamente para sempre e não cair mais.

## O que será feito

1. **Sessão de longa duração no backend**
   - Aumentar a validade da sessão (refresh token) para o máximo prático, com renovação automática.
   - Assim, uma vez logado, você continua logado por meses, mesmo fechando o navegador.

2. **Persistência garantida no app**
   - Confirmar que o cliente de autenticação salva a sessão no navegador e renova o token automaticamente em segundo plano.
   - Renovar a sessão sempre que o app volta a ficar visível (troca de aba / retorno ao site), evitando o "deslogou sozinho".

3. **Entrada única para você**
   - Gerar um link de redefinição de senha para você definir uma senha e entrar uma vez.
   - Depois desse login, a sessão fica ativa e o link **Admin** aparece no cabeçalho, com `/admin` abrindo direto.

## Detalhes técnicos

- Ajuste de auth (Lovable Cloud): JWT expiry padrão + refresh token com expiração longa e rotação habilitada.
- `src/integrations/supabase/client.ts` é auto-gerado; a persistência (`localStorage`, `autoRefreshToken`, `persistSession`) já é o comportamento padrão — apenas será validada.
- Novo listener leve (em `src/hooks` ou no provider de auth) chamando `supabase.auth.getSession()` no evento `visibilitychange` para forçar refresh ao retomar a aba.
- Nenhuma mudança em RLS ou papéis: `user_roles` já contém `admin` para o seu usuário.

## Observação de segurança

Sessão muito longa significa que qualquer pessoa com acesso físico ao seu navegador entra como admin. Recomendo manter isso apenas no seu dispositivo pessoal.
