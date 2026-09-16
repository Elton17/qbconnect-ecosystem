# Padronização visual das capas de eventos

## Objetivo
Substituir as fotografias dos eventos por capas tipográficas únicas, usando o próprio nome do evento como destaque. O padrão seguirá a direção escolhida: vermelho editorial, composição assimétrica e linguagem gráfica forte.

## Implementação
- Criar uma capa reutilizável para eventos, com:
  - coluna vermelha para dia e mês;
  - área escura para o nome do evento em destaque;
  - categoria, modalidade e valor/gratuidade em posições fixas;
  - marca discreta “QBCAMP Conecta Mais”;
  - ajuste automático para títulos curtos e longos, sem sobreposição.
- Aplicar o mesmo padrão na agenda principal, nos eventos em destaque e na página individual de cada evento.
- Adaptar a apresentação dos eventos exibidos nos “Destaques da região” da página inicial, evitando que uma foto antiga volte a aparecer nesse local.
- Retirar do formulário de criação e edição o campo de envio de imagem de capa, pois a capa passará a ser gerada automaticamente com os dados do evento.
- Preservar os endereços de imagens já salvos no banco, sem apagar arquivos ou histórico; eles apenas deixarão de ser exibidos.

## Direção visual aprovada
- Paleta: vermelho QBCAMP, preto institucional, branco e cinza claro.
- Composição: data em bloco lateral e título ocupando a maior área.
- Tipografia: estilo editorial forte localizado nas capas, preservando a identidade geral do portal fora delas.
- Movimento: entrada discreta e leve elevação no foco/hover, respeitando a preferência por redução de movimento.
- Formato estável em desktop e celular, com proporção 16:9 e boa leitura em temas claro e escuro.

## Validação
- Conferir títulos muito curtos, médios e longos.
- Conferir eventos gratuitos, pagos, presenciais, online e híbridos.
- Testar agenda, destaque, detalhe e página inicial em desktop e celular.
- Confirmar que filtros, inscrições, edição, moderação e SEO dos eventos continuam funcionando.
