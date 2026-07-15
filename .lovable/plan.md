## Objetivo
Fazer com que qualquer visitante que acesse a raiz do site (`/`) veja a landing page de contagem regressiva até o lançamento oficial em **15/08/2026**. A plataforma real continua acessível via rotas diretas (`/marketplace`, `/login`, `/cadastro` etc.) para testes internos.

## Alterações

### 1. `src/pages/PreLaunchPage.tsx`
- Trocar o `LAUNCH_DATE` dinâmico (hoje + 30 dias) por data fixa:
  ```ts
  const LAUNCH_DATE = new Date("2026-08-15T00:00:00-03:00");
  ```
- Ajustar o link do rodapé "Já sou associado" para apontar para `/login` (acesso interno enquanto não lança), mantendo também acesso a `/cadastro`.

### 2. `src/App.tsx`
- Trocar a rota `/` para renderizar `PreLaunchPage` (fora do `MainLayout`, sem header/footer).
- Mover a antiga `LandingPage` para uma rota interna, ex.: `/home` (assim quem já conhece pode acessar o site normalmente).
- Manter todas as outras rotas (`/marketplace`, `/login`, `/cadastro`, `/admin`, etc.) inalteradas e funcionais.
- A rota `/em-breve` continua existindo como alias.

```text
/           → PreLaunchPage (contagem regressiva - pública)
/home       → LandingPage (site real, oculto)
/em-breve   → PreLaunchPage (alias)
/marketplace, /login, /cadastro, ... → inalteradas
```

### 3. SEO
- O `PreLaunchPage` já ajusta `title` e `meta description` via `useEffect`. Sem mudanças adicionais em `index.html` necessárias.

## Fora de escopo
- Não alterar layout visual, formulário de waitlist, ou lógica de autenticação.
- Não mexer em backend / RLS.
- Não publicar automaticamente — você faz o deploy quando quiser via "Publish".
