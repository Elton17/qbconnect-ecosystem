# Revisão geral para o lançamento oficial

Objetivo: passar por todas as telas do site como um visitante e como administrador, encontrar o que está quebrado ou incompleto e corrigir na hora. A página de contagem regressiva continua na entrada do endereço principal — nada muda nisso.

## Como será feito

1. **Teste automatizado de todas as páginas**
   Abrir uma por uma, conferir se carrega sem erro, se as imagens aparecem, se as listas trazem conteúdo e se os botões levam ao lugar certo:
   - Contagem regressiva (formulário de pré-cadastro, envio e validações)
   - Home, Marketplace, Produto, Serviços, Oportunidades
   - Academia, Trilha, Curso, Meus Cursos, Certificado
   - Eventos, Evento, Ranking, Benefícios, SAC
   - Empresa, Cadastro, Login, Esqueci minha senha, Nova senha
   - Página de endereço inexistente (mensagem de "não encontrado")

2. **Áreas com login**
   Entrar com uma conta de teste e conferir Perfil, Painel da empresa, Painel do instrutor, Painel do evento e o painel administrativo (incluindo Lista de Espera, busca, filtros, ações em lote e exportação).

3. **Correção dos problemas encontrados**
   Erros de tela em branco, links quebrados, textos com aviso vermelho no console, campos que não salvam, listas vazias sem mensagem explicativa e telas desalinhadas serão corrigidos direto. Já identificado: um aviso de referência no campo de seleção da página de contagem regressiva.

4. **Conferência final**
   Rodar os testes do projeto, revisar títulos e descrições das páginas para busca no Google, e entregar um relatório do que foi conferido e do que foi corrigido.

## Detalhes técnicos

- Testes de navegação via Playwright headless contra `localhost:8080`, com captura de console e screenshots por rota.
- Autenticação de teste via sessão do Lovable Cloud (conta admin existente).
- Correção do aviso `Function components cannot be given refs` em `src/components/ui/select.tsx` (SelectContent sem `forwardRef` correto) e demais avisos de React encontrados.
- Verificação de estados vazios/carregando nas consultas ao banco (produtos, cursos, eventos, oportunidades, benefícios, ranking).
- Rodar `vitest` e conferir tipos.
- Sem mudanças de rotas, de banco de dados ou de identidade visual.

## Fora do escopo (a pedido)

- Liberar o site completo no endereço principal (o contador permanece).
- Revisão de segurança do banco, desempenho e SEO profundo — posso fazer depois, se quiser.
