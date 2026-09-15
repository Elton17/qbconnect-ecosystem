# Portal de Notícias e ocultação temporária dos cursos

## Objetivo
Substituir, por enquanto, a presença pública da Escola de Negócios por um Portal de Notícias colaborativo, preservando integralmente os cursos, vídeos, alunos e certificados existentes para futura reativação.

## Experiência do portal
1. Trocar “Escola de Negócios” por “Notícias” nos menus do computador, celular e rodapé.
2. Remover da página inicial, busca geral e áreas visíveis as chamadas, estatísticas e atividades relacionadas a cursos.
3. Ocultar “Meus Cursos” e “Painel Instrutor” dos menus do usuário.
4. Manter os endereços atuais de cursos, trilhas, certificados e gestão funcionando para quem possuir o link direto; nenhum dado ou arquivo será apagado.
5. Criar uma página pública de Notícias com destaque principal, notícias recentes, busca e filtro por segmento/categoria.
6. Criar a página completa de cada notícia, mostrando imagem, título, resumo, conteúdo, categoria, autor/empresa e data.

## Publicação pelos associados
1. Adicionar no painel da empresa a área “Minhas Notícias”.
2. Permitir envio somente por empresas aprovadas.
3. O formulário terá título, resumo, conteúdo completo, categoria e imagem de capa.
4. O associado poderá salvar, editar e excluir suas próprias notícias enquanto acompanha o estado: aguardando aprovação, publicada ou recusada.
5. Toda notícia nova ou alterada volta para aprovação antes de aparecer publicamente.

## Aprovação administrativa
1. Substituir as áreas administrativas visíveis de cursos, relatórios e alunos por uma aba “Notícias”.
2. Exibir filtros por aguardando aprovação, publicada e recusada, além de busca por título ou empresa.
3. Permitir ao administrador visualizar, aprovar, recusar, editar, retirar de publicação e excluir notícias.
4. Exigir confirmação antes das decisões e usar a confirmação de exclusão já adotada no portal.
5. A recusa poderá registrar uma justificativa para o associado corrigir e reenviar.

## Segurança e dados
- Criar uma estrutura própria para notícias, vinculada à empresa autora.
- Somente o autor poderá criar e alterar suas notícias; somente administradores poderão aprovar ou recusar.
- Visitantes verão apenas notícias aprovadas e de empresas aprovadas.
- Armazenar capas em uma área própria, com envio restrito à pasta do usuário e leitura pública.
- Manter papéis administrativos separados dos perfis, seguindo as proteções atuais.

## Validação
- Confirmar que cursos desapareceram dos menus, página inicial, busca e painel, mas continuam acessíveis por link direto.
- Testar envio por empresa aprovada e bloqueio para empresa não aprovada.
- Testar aprovação, recusa com justificativa, correção e reenvio.
- Confirmar que notícias pendentes ou recusadas não aparecem ao público.
- Validar listagem, detalhe, imagens, busca e filtros no computador e celular, incluindo modo escuro.

## Detalhes técnicos
A implementação usará uma nova tabela de notícias com estados editoriais, regras de acesso por proprietário e administrador, e um novo local para imagens. As rotas e dados de cursos serão preservados; apenas seus pontos de entrada visíveis serão condicionados para facilitar a reativação futura.
