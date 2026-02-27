

# Endereço Completo no Cadastro

## Objetivo
Expandir o formulário de cadastro para capturar o endereço completo da empresa em campos separados (Endereço/Logradouro, Bairro, Cidade, Complemento, Ponto de Referência, CEP e Estado), preenchendo automaticamente via CNPJ quando possível. O mapa com Google Maps será adicionado futuramente.

## O que muda para o usuário
- Ao digitar o CNPJ, os campos de endereço (rua, bairro, cidade, CEP, estado) serão preenchidos automaticamente com os dados da Receita Federal.
- Campos de Complemento e Ponto de Referência ficam disponíveis para preenchimento manual.
- O campo "Cidade" deixa de ser um dropdown fixo e passa a aceitar a cidade retornada pelo CNPJ, mantendo as cidades da região como sugestões.

---

## Detalhes Técnicos

### 1. Migração do Banco de Dados
Adicionar novas colunas na tabela `profiles`:

| Coluna | Tipo | Default |
|--------|------|---------|
| `neighborhood` | text | '' |
| `complement` | text | '' |
| `reference_point` | text | '' |
| `zip_code` | text | '' |
| `state` | text | '' |

### 2. Atualizar Edge Function `cnpj-lookup`
Retornar campos separados em vez de concatenar tudo em `address`:

```text
Antes: address = "Rua X, 123, Sala 1, Centro"
Depois: street, number, complement, neighborhood, city, state, zip_code (campos individuais)
```

Dados disponíveis na BrasilAPI: `logradouro`, `numero`, `complemento`, `bairro`, `municipio`, `uf`, `cep`.

### 3. Atualizar Formulário de Cadastro (`CompanyRegistrationPage.tsx`)
- Substituir o campo único "Endereço" por campos separados: Endereço (logradouro + numero), Bairro, Complemento, Ponto de Referência, CEP e Estado.
- Mudar o campo "Cidade" para `Input` em vez de `Select` fixo, permitindo receber a cidade vinda do CNPJ.
- Atualizar o schema Zod com os novos campos (CEP, bairro e estado obrigatórios; complemento e ponto de referência opcionais).
- Atualizar `lookupCNPJ` para preencher cada campo individualmente.
- Atualizar `onSubmit` para salvar os novos campos no banco.

### 4. Sequencia de Implementacao
1. Migrar banco (adicionar colunas)
2. Atualizar edge function
3. Atualizar formulario e logica de submit

