# Notícias na empresa, limite de anúncios e rodízio do Marketplace

## Objetivo
Atualizar a página pública de cada empresa para mostrar suas notícias no lugar dos cursos, limitar a vitrine a cinco anúncios ativos por empresa e alternar a ordem dos anúncios a cada novo acesso ao Marketplace.

## Alterações

### 1. Substituir Cursos por Notícias na página da empresa
- Trocar a aba “Cursos” por “Notícias”, mantendo as abas Oportunidades e Benefícios.
- Carregar somente notícias publicadas pela empresa exibida e com estado aprovado.
- Mostrar título, resumo, categoria, data e imagem de capa quando disponível.
- Cada notícia levará à sua página completa.
- Atualizar contadores, ícone e mensagem de ausência de conteúdo sem alterar ou apagar os cursos existentes.

### 2. Limitar produtos e serviços a cinco por empresa
- Aplicar o limite combinado de **5 anúncios ativos**, somando produtos e serviços da mesma empresa.
- Manter a edição dos anúncios existentes liberada; excluir ou desativar um anúncio libera uma vaga.
- Mostrar no formulário e nos atalhos quantas vagas ainda estão disponíveis e impedir uma nova publicação quando o limite for atingido.
- Ajustar o indicador do painel da empresa para exibir corretamente o uso de `0/5` até `5/5`.
- Garantir o limite também no banco de dados, evitando que múltiplos envios simultâneos ou chamadas fora da tela ultrapassem cinco anúncios.
- Exibir uma mensagem clara quando a empresa já tiver atingido o limite.

### 3. Alternar os anúncios no Marketplace
- Tornar “Alternados” a ordem inicial da vitrine.
- Gerar uma ordem pseudoaleatória nova em cada acesso ao Marketplace.
- Manter essa ordem estável enquanto a pessoa pesquisa, filtra ou altera a tela, evitando que os cards mudem de lugar a cada interação.
- Embaralhar todos os anúncios elegíveis com igualdade, independentemente da data de cadastro, para que os antigos também apareçam nas primeiras posições.
- Preservar as ordenações escolhidas manualmente por menor preço, maior preço, mais acessados e mais recentes.
- Manter a faixa específica de destaques Premium existente, sem retirar os anúncios Premium do rodízio geral.

## Segurança e consistência
- A regra de cinco anúncios será validada no banco com bloqueio por empresa durante a criação/reativação, impedindo concorrência entre envios.
- A contagem usará o proprietário autenticado do anúncio; nenhum identificador enviado pelo navegador poderá ampliar o limite de outra empresa.
- As regras atuais de empresa aprovada, publicação imediata e propriedade dos anúncios serão preservadas.

## Validação
- Confirmar que a página de uma empresa mostra somente as notícias aprovadas daquela empresa e não exibe mais cursos.
- Testar criação do primeiro ao quinto anúncio e bloqueio do sexto, contando produtos e serviços juntos.
- Confirmar que editar um anúncio não consome nova vaga e que excluir/desativar libera uma vaga.
- Simular dois cadastros simultâneos quando já existirem quatro anúncios e confirmar que apenas um é aceito.
- Reabrir o Marketplace e verificar uma nova ordem; durante a mesma visita, testar busca e filtros sem reembaralhamento inesperado.
- Validar computador e celular, além dos testes automatizados e verificação de tipos.

## Detalhes técnicos
- A aba de notícias usará a relação existente entre `news.profile_id` e a empresa, filtrando `status = 'approved'`, e reutilizará a preparação atual das capas privadas.
- O limite será refletido nos limites de plano e reforçado por função/trigger transacional no banco para inserções e reativações.
- O rodízio usará uma semente criada ao entrar na página e uma chave determinística por anúncio; não serão gravadas impressões nem criadas novas tabelas.
