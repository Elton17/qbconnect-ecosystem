# Publicação direta e novos cadastros na área logada

## Objetivo
Facilitar a criação de produtos, serviços e notícias pelas empresas aprovadas, publicar automaticamente produtos, notícias e benefícios, adicionar parcelamento ao Marketplace e tornar a logo opcional nos dois caminhos de cadastro empresarial.

## Área logada
1. Criar uma área de ações rápidas no painel da empresa com três destaques claros:
   - “Cadastrar produto”;
   - “Cadastrar serviço”;
   - “Cadastrar notícia”.
2. Abrir o formulário do Marketplace já com o tipo correto ao escolher produto ou serviço.
3. Abrir diretamente o formulário de nova notícia ao escolher notícia.
4. Manter essas ações disponíveis somente para empresas com cadastro aprovado, mostrando uma orientação adequada para quem ainda aguarda aprovação.
5. Preservar os locais atuais de edição e exclusão dos conteúdos.

## Marketplace
1. Permitir abrir o cadastro de um novo anúncio por endereço e pelo painel logado, além do fluxo atual de edição.
2. Separar automaticamente os anúncios pelo campo de tipo:
   - produto aparece em “Produtos”;
   - serviço aparece em “Serviços”.
3. Ajustar as categorias para não usar “Produtos” e “Serviços” como categorias de segmento; o tipo do anúncio fará essa separação.
4. Adicionar a opção de preço parcelado:
   - informar o valor total;
   - escolher a quantidade de parcelas;
   - calcular automaticamente o valor aproximado de cada parcela;
   - exibir total e parcelamento nos cartões, detalhes e área logada.
5. Manter as opções atuais de preço fixo, negociável e “consultar”. O parcelamento só será exibido quando houver valor informado e mais de uma parcela.

## Notícias
1. Manter “Minhas Notícias” no painel e destacar o botão “Cadastrar notícia”.
2. Publicar novas notícias e alterações imediatamente, preenchendo a data de publicação.
3. Atualizar mensagens e estados visuais para “Publicada”, sem textos de envio ou reenvio para aprovação.
4. Continuar exigindo que a empresa esteja aprovada para publicar.

## Benefícios e publicação imediata
1. Produtos, notícias e benefícios novos ou editados serão publicados imediatamente por empresas aprovadas.
2. Atualizar as regras do banco para permitir que o proprietário aprovado grave apenas o estado publicado, sem poder assumir outra empresa ou alterar autoria.
3. Manter os filtros públicos em conteúdos publicados/ativos como proteção adicional.
4. Publicar os produtos, notícias e benefícios que já estão pendentes, conforme solicitado.
5. Retirar esses três tipos da fila de aprovações pendentes e das ações de moderação do administrador, sem alterar a aprovação de empresas, eventos ou oportunidades.

## Logo opcional no cadastro
1. Remover a obrigatoriedade da logo no cadastro direto de empresa.
2. Remover a obrigatoriedade da logo na ativação por convite.
3. Quando nenhuma imagem for enviada, concluir o cadastro normalmente e manter o espaço de logo vazio com o símbolo padrão já usado no portal.
4. Manter upload, validação e edição de logo disponíveis depois, na área logada e administrativa.

## Detalhes técnicos
- Adicionar ao anúncio um campo de quantidade de parcelas, com padrão de uma parcela e validação de limite seguro.
- Aplicar a alteração estrutural por migração e atualizar os tipos usados pelo portal.
- Ajustar as políticas de acesso de `products`, `news` e `benefits` para publicação direta somente por usuários autenticados vinculados a empresas aprovadas.
- Atualizar separadamente os registros pendentes existentes para publicados; notícias receberão data de publicação quando ainda estiver vazia.
- Tornar os dados de logo opcionais na função de ativação, sem enviar conteúdo vazio ao armazenamento.

## Validação
- Testar os três atalhos no painel em computador e celular.
- Confirmar que produto e serviço abrem o formulário com o tipo correto e aparecem no filtro correto.
- Testar preço total com parcelamento e conferir o cálculo em cadastro, cartão, detalhe e edição.
- Criar e editar produto, notícia e benefício com uma empresa aprovada e confirmar publicação imediata.
- Confirmar que empresa não aprovada continua impedida de publicar.
- Confirmar que os conteúdos pendentes antigos passam a aparecer e saem da fila administrativa.
- Concluir cadastro direto e ativação por convite sem logo, e testar inclusão posterior pela área logada.
