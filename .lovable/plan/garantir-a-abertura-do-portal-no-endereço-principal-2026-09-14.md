# Garantir a abertura do portal no endereço principal

## Objetivo
Fazer o endereço principal abrir o portal imediatamente, inclusive para visitantes cujo navegador ainda mantém a antiga página do contador salva.

## Implementação
1. Ajustar a atualização do aplicativo instalado para assumir a nova versão imediatamente e remover caches antigos incompatíveis.
2. Adicionar uma limpeza pontual do cache legado do contador, sem apagar login ou outros dados do usuário.
3. Manter o portal atual nas rotas `/` e `/home`; o contador continuará fora da navegação.
4. Validar o endereço público em uma sessão limpa e em uma sessão simulando cache antigo, no computador e no celular.
5. Publicar a correção para o domínio `conectamais.qbcamp.com.br`.

## Resultado esperado
Ao acessar ou atualizar o domínio principal, todos verão a página inicial do portal em vez do contador antigo.

## Detalhes técnicos
A correção será limitada ao service worker e à estratégia de atualização do PWA. Não haverá mudanças no visual, conteúdo, banco de dados ou acessos administrativos.
