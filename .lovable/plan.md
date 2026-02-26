

## Status da Proposta Inicial

| # | Item | Status |
|---|------|--------|
| 1 | CNPJ Auto-fill via BrasilAPI | Done |
| 2 | Adicionar cidades (Colombo, Pinhais, Curitiba) | Done |
| 3 | Tabelas no banco (opportunities, courses, benefits + RLS) | Done |
| 4 | Marketplace com dados reais | Done |
| 5 | Oportunidades — CRUD completo | Done |
| 6 | Academia — CRUD completo | Done |
| 7 | Benefícios — CRUD completo | Done |
| 8 | Ranking com dados reais | Done |

**Todos os 8 itens da proposta foram implementados.**

---

## Pendencias fora da proposta, mas identificadas no projeto

1. **Painel Admin com dados mock** — O `AdminPage.tsx` exibe estatísticas, aprovacoes e transacoes com dados hardcoded. Os botoes "Aprovar" e "Rejeitar" nao funcionam. Precisa ser conectado ao backend real.

2. **Roadmap MVP (da memoria do projeto)** menciona itens ainda nao implementados:
   - Sistema de comissao automatica
   - Matchmaking simples entre empresas
   - Sistema de creditos QBCoin (Fase 2)

3. **Funcionalidades menores ausentes**:
   - Botao "Ver perfil" no Marketplace nao leva a uma pagina de perfil publico da empresa
   - Nao ha pagina publica de detalhes de oportunidade/curso/beneficio
   - O admin nao consegue aprovar/rejeitar empresas pelo painel (so via query manual)

