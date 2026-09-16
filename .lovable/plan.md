# Corrigir edição de empresas e aprovações no painel administrativo

## Resultado esperado

- A empresa poderá anexar ou substituir sua logo de forma visível na área logada.
- O administrador poderá anexar ou substituir a logo ao editar qualquer empresa.
- A área **Aprovações Pendentes** reunirá todas as filas que exigem ação administrativa.
- A aba escolhida no painel será preservada ao editar, atualizar dados, abrir um item e retornar ou recarregar a página.

## 1. Logo na edição da empresa

- Tornar o envio da logo uma ação explícita dentro da edição do perfil, além da prévia atual.
- Exibir prévia com autoajuste, estados de envio e mensagens para arquivo inválido.
- Aceitar JPG, PNG e WebP até 2 MB.
- No modal **Editar Registro** do administrador, adicionar a mesma prévia e os controles para anexar ou substituir a logo.
- Salvar a nova imagem no espaço de logos da empresa e atualizar o cadastro correspondente.
- Ajustar as permissões para o administrador editar logos de empresas sem ampliar o acesso de usuários comuns.

## 2. Central de aprovações pendentes

Hoje o resumo mostra somente empresas com cadastro não aprovado. Ele passará a reunir:

- empresas aguardando aprovação;
- pré-cadastros pendentes da Lista de Espera;
- produtos em análise;
- notícias aguardando publicação;
- eventos em análise;
- oportunidades em análise;
- benefícios em análise.

O painel mostrará o total geral e a quantidade por categoria. Cada item terá identificação, data e ação para abrir a aba correta já filtrada. As filas continuarão vazias quando não houver registros pendentes — como ocorre atualmente no banco — sem criar alertas falsos.

## 3. Permanência na aba administrativa

- Sincronizar a aba ativa com o endereço do painel, por exemplo `/admin?aba=empresas`.
- Preservar a aba ao salvar edições, aprovar conteúdos e atualizar as listas.
- Ao abrir uma página para visualizar empresa, produto ou evento, guardar a origem para que o retorno volte à mesma aba.
- Aceitar somente nomes de abas válidos; endereços antigos ou inválidos continuarão abrindo a Visão Geral.
- Manter busca e filtros da aba durante operações locais sempre que não houver saída da página.

## 4. Revisão e validação

- Testar troca entre todas as abas, edição, aprovação, recarregamento e retorno pelo navegador.
- Testar upload e substituição de logo como empresa e como administrador.
- Conferir que usuários comuns só alteram a própria logo.
- Simular pelo menos uma pendência de cada categoria e confirmar contadores, atalhos e ações.
- Validar o painel no computador e celular, sem cortes no modal nem perda da aba selecionada.

## Detalhes técnicos

- A aba hoje já é controlada em memória, mas começa sempre em `overview` quando a página é remontada; o parâmetro no endereço será a fonte persistente.
- O armazenamento de logos já restringe gravações à pasta do próprio usuário. Será criada uma autorização administrativa específica, mantendo leitura pública e escrita comum limitada ao proprietário.
- Cursos não entrarão na central: estão ocultos e não possuem fluxo de moderação. Registros existentes serão preservados.
