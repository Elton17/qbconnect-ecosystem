# Destaque regional do Marketplace e capas automáticas

## Objetivo
Criar uma chamada comercial marcante na página inicial para incentivar compras regionais e substituir o espaço vazio dos anúncios sem foto por uma capa tipográfica padronizada.

## Página inicial
- Adicionar uma faixa ampla do Marketplace entre as vantagens do portal e os módulos principais.
- Usar a direção visual escolhida: fundo escuro, acentos vermelhos QBCAMP, composição limpa e forte contraste.
- Aplicar a mensagem principal: **“Compre aqui. Compre na região. Fortaleça as empresas locais.”**
- Incluir texto curto sobre produtos e serviços regionais e botão **“Acessar Marketplace”**.
- Criar uma composição visual própria com símbolos de produto, serviço e localização, sem promover uma empresa específica.
- Manter animação discreta na entrada e adaptação completa para celular e modo escuro.

## Capas automáticas sem foto
- Criar um componente reutilizável de capa tipográfica para anúncios sem imagem.
- A capa será montada pelo próprio portal, sem custo de geração por inteligência artificial e sem salvar arquivos adicionais.
- Exibir automaticamente:
  - título do anúncio em destaque;
  - identificação **Produto local** ou **Serviço local**;
  - categoria, quando disponível;
  - assinatura visual **QBCAMP Conecta+**.
- Variar a composição de forma previsível pelo anúncio, mantendo vermelho, preto, branco e cinza e evitando que todos os cards pareçam idênticos.
- Controlar títulos longos com redução de tamanho e limite de linhas, preservando legibilidade.

## Aplicação completa
- Usar a capa automática nos cards do Marketplace, destaques premium e galeria da página do anúncio.
- Preservar integralmente as fotos enviadas pelos empresários; a capa aparece apenas quando nenhuma imagem estiver cadastrada.
- Usar descrição alternativa adequada para acessibilidade.

## Validação
- Conferir home e Marketplace em desktop e celular.
- Conferir anúncios com e sem imagem, produtos e serviços, títulos curtos e longos.
- Validar modos claro e escuro, links, ausência de sobreposição e testes existentes.

## Detalhes técnicos
- Criar um componente visual único para evitar estilos divergentes entre listagem, destaque e página interna.
- Derivar a variação visual do identificador do anúncio, garantindo que a mesma publicação sempre mantenha a mesma capa.
- Não alterar banco de dados, fluxo de publicação, upload de imagens ou contato por WhatsApp.
