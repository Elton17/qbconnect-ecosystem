# Deixar "Esqueci minha senha" fácil de encontrar

O link já existe na tela de login, mas está pequeno e discreto abaixo do botão. Vamos torná-lo visível e criar caminhos extras para chegar nele.

## O que muda

1. **Tela de login (/login)**
   - Mover "Esqueci minha senha" para o lado do rótulo do campo Senha (padrão de mercado, canto direito), com destaque em vermelho da marca.
   - Manter também um botão secundário claro "Esqueci minha senha" abaixo do botão Entrar, com ícone de chave.

2. **Cabeçalho / menu do usuário**
   - No menu do usuário logado, adicionar item "Alterar senha" que leva ao fluxo de recuperação.

3. **Página de recuperação (/esqueci-senha)**
   - Deixar o texto de ajuda mais claro: informar que o e-mail pode levar alguns minutos e checar a caixa de spam.

## Detalhes técnicos

- `src/pages/LoginPage.tsx`: reorganizar o bloco do campo de senha (Label + link) e adicionar botão secundário no `CardFooter`.
- `src/components/layout/Header.tsx`: novo item de menu apontando para `/esqueci-senha`.
- `src/pages/ForgotPasswordPage.tsx`: ajuste de copy apenas.
- Sem mudanças de banco, rotas ou lógica de autenticação — `/esqueci-senha` e `/reset-password` já existem e funcionam.
