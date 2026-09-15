# Renovação visual da home, banners e edição completa

## Objetivo
Tornar o portal mais visual e consistente, substituindo a lista “Atividade Recente” por uma vitrine editorial, adicionando banners fotográficos às áreas públicas e garantindo que empresas possam editar todos os conteúdos que publicam. A logo será obrigatória no cadastro e aparecerá automaticamente, sem cortes, na home.

## 1. Nova vitrine editorial na home
- Substituir “Atividade Recente” pela direção escolhida **Vitrine editorial**.
- Usar somente dados reais e publicados do portal:
  - notícia principal com imagem, categoria, resumo e link;
  - próximos eventos com data, local e acesso à inscrição;
  - oportunidade empresarial ativa com ação de contato;
  - pequenos destaques adicionais da rede quando houver conteúdo.
- Não exibir números, empresas, visualizações ou afirmações inventadas.
- Criar estados adequados quando alguma categoria estiver vazia, sem deixar espaços quebrados.
- Manter vermelho, preto, branco e cinzas, com modo escuro, animações discretas e adaptação completa para celular.

## 2. Banners fotográficos em todas as áreas públicas
- Criar uma família visual coerente de banners para os menus principais: **Marketplace, Empresas, Oportunidades, Notícias, Eventos, Benefícios, Ranking e Serviços**.
- Preservar o carrossel já existente no Marketplace, ajustando-o ao mesmo padrão visual quando necessário.
- Usar fotografias regionais e empresariais próprias para cada tema, sem promover cliente ou produto específico.
- Aplicar título curto, contexto da área e ação útil quando houver; manter texto legível, enquadramento responsivo e um trecho do conteúdo seguinte visível.
- Não adicionar banners em páginas administrativas, login, cadastro, formulários internos ou páginas de detalhes.

## 3. Logo obrigatória no cadastro empresarial
- Tornar o envio da logo obrigatório tanto no cadastro direto quanto na ativação por convite da Lista de Espera.
- Validar formato e tamanho antes do envio e mostrar prévia sem cortar a marca.
- Corrigir o cadastro atual para realmente salvar o arquivo na conta da empresa e gravar sua referência no perfil.
- Manter a troca da logo disponível na edição do perfil.
- Padronizar a exibição com área proporcional, `object-contain`, margens internas e fundo neutro para logos quadradas, verticais ou horizontais.
- Na home, carregar automaticamente apenas logos de empresas aprovadas, usar alternativa visual se a imagem falhar e impedir que arquivos muito grandes prejudiquem o carregamento.

## 4. Edição em todos os locais de conteúdo
- Revisar e padronizar ações de **Editar** para conteúdos pertencentes à empresa:
  - dados e contatos da empresa;
  - produtos e serviços do Marketplace;
  - notícias;
  - eventos;
  - oportunidades;
  - benefícios.
- Garantir que “Meus conteúdos/Meus anúncios” e cada página de gerenciamento abram o item correto já preenchido.
- Manter campos internos imutáveis, como proprietário, data de criação, métricas e controles administrativos.
- Conteúdos publicados que forem alterados voltarão para **aprovação do administrador**, conforme escolhido. Enquanto aguardam, a versão pública anterior permanece visível quando tecnicamente segura; para conteúdos cujo modelo atual não guarda versões, o item ficará pendente até nova aprovação, sem publicar a alteração automaticamente.
- Exibir claramente os estados “Em análise”, “Publicado” e “Rejeitado”, incluindo o motivo da rejeição quando disponível.
- Preservar cursos ocultos; eles não entram nesta revisão visual nem voltam aos menus.

## 5. Administração e segurança
- Permitir ao administrador revisar e aprovar novamente conteúdos editados.
- Manter cada empresa limitada aos próprios dados e conteúdos.
- Ajustar regras e campos de status somente onde forem necessários para aplicar a nova aprovação, com permissões explícitas e proteção por usuário.
- Não alterar o modelo de contato humanizado por WhatsApp nem adicionar pagamento online.

## Validação
- Testar criação, edição, reenvio para aprovação, aprovação e rejeição em todos os tipos de conteúdo listados.
- Confirmar que um associado não consegue editar conteúdo de outra empresa.
- Testar cadastro direto e ativação por convite com logo obrigatória, troca posterior da logo e exibição automática na home.
- Conferir todos os banners e a vitrine editorial em computador e celular, nos modos claro e escuro, sem cortes, sobreposições ou rolagem lateral.
- Verificar links, estados vazios, imagens ausentes e desempenho básico das imagens.
- Atualizar o roadmap do projeto ao iniciar e concluir cada frente.

## Detalhes técnicos
- Reutilizar os formulários existentes de produtos, notícias, eventos, oportunidades, benefícios e perfil, corrigindo os pontos onde a edição não reabre ou não persiste todos os campos.
- Reutilizar o armazenamento de logos já existente e salvar cada arquivo na pasta da própria conta.
- Criar um componente compartilhado para os banners públicos e alimentar cada página com imagem, título e ação próprios.
- Reestruturar o componente atual da atividade da home para combinar consultas de notícias aprovadas, eventos ativos e oportunidades ativas.
- Quando a edição precisar preservar a versão pública anterior, avaliar o menor acréscimo de dados possível; caso contrário, aplicar o estado pendente ao registro existente conforme descrito acima.
