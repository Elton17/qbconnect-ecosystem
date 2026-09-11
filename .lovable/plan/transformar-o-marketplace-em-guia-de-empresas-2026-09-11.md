# Transformar o Marketplace em Guia de Empresas

## Objetivo
Substituir a vitrine de produtos e promoções por um guia regional de empresas associadas, facilitando encontrar fornecedores confiáveis e iniciar contato direto.

## O que será alterado
- Atualizar a apresentação da página para “Guia de Empresas Associadas”, mantendo a identidade visual QBCAMP.
- Remover dessa página os destaques de produtos, promoções, preços e filtros comerciais atuais.
- Carregar somente empresas aprovadas já cadastradas no portal.
- Exibir indicadores úteis, como quantidade de empresas, segmentos e cidades representadas.
- Criar busca por nome da empresa, atividade ou palavra-chave da descrição.
- Adicionar filtros rápidos por segmento e cidade, com opção para limpar filtros.
- Mostrar cada empresa em um cartão com logo, nome, segmento, cidade e breve descrição.
- Incluir ações claras para abrir o perfil completo e falar pelo WhatsApp quando houver número disponível.
- Criar estados adequados de carregamento, ausência de resultados e empresa sem logo.
- Adaptar a experiência para celular e computador, preservando o modo escuro.

## Navegação e conteúdo existente
- Manter o endereço `/marketplace`, evitando quebrar links atuais.
- Reutilizar as páginas de perfil já existentes em `/empresa/:id`.
- Os cadastros de produtos e promoções não serão apagados do banco; apenas deixarão de aparecer nesta página.
- Não haverá mudança nas regras de aprovação das empresas nem no painel administrativo.

## Detalhes técnicos
- A fonte de dados será a lista pública de perfis com `approved: true`.
- A consulta pública usará apenas os campos empresariais já autorizados.
- Busca e filtros serão aplicados na própria página, sem criar novas tabelas ou alterar o banco.
- Os componentes exclusivos da antiga vitrine serão desacoplados da página, sem excluir arquivos ainda reutilizáveis em outros fluxos.

## Validação
- Verificar pesquisa por nome, segmento e descrição.
- Verificar filtros de segmento e cidade, inclusive combinados.
- Confirmar abertura do perfil e contato pelo WhatsApp.
- Testar visualmente em celular e computador, nos modos claro e escuro.
