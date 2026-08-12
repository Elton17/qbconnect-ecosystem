# Deixar "Lista de Espera" fácil de encontrar no /admin

Hoje a aba existe, mas fica na última posição da faixa de abas, caindo para a segunda linha (e exigindo rolagem no celular).

## O que muda

- Mover a aba **Lista de Espera** para logo depois de "Visão Geral", como segunda aba do painel.
- Destacar a aba com um ícone e o contador de registros (ex.: "Lista de Espera (3)").
- Tornar o card **Lista de Espera** dos indicadores do topo clicável, abrindo direto essa aba (incluindo um card novo caso ainda não exista entre os indicadores).

Nada muda nos dados, filtros, exportação CSV ou ações em lote já existentes.

## Detalhes técnicos

- `src/pages/AdminPage.tsx`: reordenar os `TabsTrigger` dentro do `TabsList` (linhas ~437-451) e adicionar ícone via `lucide-react`.
- Usar o estado controlado do `Tabs` (`value` / `onValueChange`) para permitir que o card do topo defina a aba ativa como `waitlist`.
