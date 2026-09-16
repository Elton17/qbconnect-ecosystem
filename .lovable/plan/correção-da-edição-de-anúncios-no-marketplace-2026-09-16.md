# Correção da edição de anúncios no Marketplace

## Objetivo
Fazer o botão **Editar** abrir o formulário do anúncio correto, já preenchido, mantendo o fluxo seguro de nova aprovação após alterações.

## Implementação
1. **Conectar o botão ao formulário de edição**
   - Trocar o redirecionamento atual por um endereço identificável do anúncio no Marketplace.
   - Fazer a página do Marketplace reconhecer esse endereço, localizar o anúncio pertencente ao usuário conectado e abrir automaticamente o formulário existente.

2. **Carregar e proteger os dados corretos**
   - Buscar o anúncio pelo identificador quando ele não estiver na vitrine pública.
   - Confirmar que somente o proprietário pode editar o anúncio.
   - Exibir uma mensagem clara caso o anúncio não exista ou não pertença ao usuário conectado.

3. **Concluir o fluxo após salvar**
   - Manter título, descrição, preço, categoria, cidade, contatos e imagens preenchidos na edição.
   - Enviar alterações novamente para aprovação, conforme a regra atual do portal.
   - Fechar o formulário, limpar o endereço de edição e atualizar a listagem sem deixar o usuário em uma tela quebrada.

4. **Revisar os demais acessos de edição**
   - Ajustar o acesso em “Meus anúncios” para abrir diretamente a edição, sem depender primeiro da página pública do produto.
   - Preservar exclusão com confirmação e os controles atuais de ativação.

## Validação
- Testar como proprietário em computador e celular.
- Confirmar abertura automática, campos preenchidos, troca/remoção de imagens e salvamento.
- Confirmar que outro usuário não consegue editar o anúncio pelo endereço.
- Confirmar que o anúncio alterado passa a pendente e aparece nas aprovações do painel administrativo.
