# Plano de indexação e SEO do QBCAMP Conecta Mais

## Diagnóstico confirmado

- A página inicial está acessível, indexável e corretamente renderizada para buscadores e assistentes de IA.
- Idioma, visualização mobile, ícone, título, descrição, regras de rastreamento e prévia social básica estão válidos.
- O portal não possui `sitemap.xml`; este é o único erro apontado pela revisão automática de fundamentos.
- As rotas usam hoje os metadados gerais da página inicial; páginas públicas e conteúdos individuais não possuem título, descrição, URL canônica e dados estruturados próprios.
- O Google Search Console ainda não está conectado ao projeto, portanto não há dados disponíveis sobre páginas efetivamente indexadas, termos pesquisados ou desempenho orgânico.

## Melhorias a implementar

### 1. Mapa completo para buscadores

- Criar um sitemap automático no domínio `https://conectamais.qbcamp.com.br`.
- Incluir as páginas públicas relevantes: início, Marketplace, Empresas, Serviços, Oportunidades, Ranking, Benefícios, Eventos, Notícias e SAC.
- Incluir automaticamente os conteúdos públicos e aprovados: notícias, eventos, produtos e empresas.
- Excluir login, recuperação de senha, ativação, cadastro, painel, perfil, administração, páginas de gestão e cursos atualmente ocultos.
- Não criar datas artificiais de atualização; usar apenas datas reais disponíveis em cada conteúdo.
- Informar o endereço do sitemap no arquivo de regras dos buscadores.

### 2. Informações próprias em cada página

- Criar uma estrutura central de SEO para definir, por página, título, descrição, URL canônica, prévia social e regra de indexação.
- Aplicar informações específicas às principais páginas públicas, usando termos regionais relevantes sem repetição artificial.
- Fazer `/home` apontar para `/` como versão principal, evitando conteúdo duplicado.
- Marcar como não indexáveis as páginas privadas, administrativas, de autenticação, ativação, formulários internos, cursos ocultos e páginas de erro.
- Preservar a identidade e o texto institucional já aprovados na página inicial.

### 3. Conteúdos dinâmicos preparados para busca

- Notícias: título e resumo próprios, canonical, imagem social quando válida e dados estruturados de artigo, autoria e data de publicação.
- Eventos: título, descrição, canonical, imagem e dados estruturados de evento, incluindo data, formato e local quando disponíveis.
- Produtos e serviços: título, descrição, canonical, imagem e dados estruturados de produto/oferta sem inventar preço ou disponibilidade.
- Empresas: nome, segmento, cidade, canonical, logo e dados estruturados de organização/localidade com apenas informações públicas.
- Garantir que páginas inexistentes, rejeitadas ou não aprovadas não sejam apresentadas como indexáveis.

### 4. Qualidade técnica e conteúdo rastreável

- Revisar a hierarquia de títulos das páginas públicas, mantendo um único título principal por tela.
- Corrigir textos alternativos vazios ou genéricos em imagens públicas relevantes.
- Garantir links internos claros entre listagens, detalhes, empresas, notícias, eventos e Marketplace.
- Manter imagens não essenciais com carregamento otimizado, sem prejudicar a imagem principal de cada página.
- Revisar consistência do nome “QBCAMP Conecta Mais” nos metadados e dados estruturados.

### 5. Validação de lançamento

- Validar sitemap, robots, canonicals, index/noindex, metadados e dados estruturados nas páginas públicas e privadas.
- Testar rotas principais e conteúdos dinâmicos em computador e celular.
- Executar testes automatizados e revisão de integridade do código.
- Rodar novamente a revisão de SEO e registrar como corrigido apenas o que for confirmado.
- Após a publicação, conectar o Google Search Console e enviar o sitemap para acompanhar indexação, consultas, cliques e eventuais erros reais do Google.

## Detalhes técnicos

- Os metadados por rota serão controlados no React sem duplicar a canonical estática.
- O sitemap será gerado antes da visualização e da publicação, consultando somente registros públicos/aprovados e usando o domínio oficial.
- Dados estruturados seguirão Schema.org: `Organization`/`WebSite`, `Article`, `Event`, `Product` e `LocalBusiness`, conforme o conteúdo realmente disponível.
- Nenhuma página, conteúdo ou curso será apagado; o trabalho altera somente descoberta, metadados, estrutura rastreável e indexação.

## Limite externo

A implementação deixa o portal tecnicamente preparado. A confirmação de indexação e desempenho no Google dependerá da conexão do Google Search Console e de uma nova publicação do portal.
