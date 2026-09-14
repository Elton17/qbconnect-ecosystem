# Aprovar ou negar empresas da Lista de Espera

## Resultado esperado

No painel administrativo, cada pré-cadastro terá as ações **Aceitar** e **Negar**.

- **Aceitar** muda o status para aprovado e abre uma mensagem pronta no WhatsApp com um link individual de ativação.
- Pelo link, o empresário confirma os dados restantes, informa o e-mail e cria a própria senha.
- Ao concluir, a empresa é transferida para **Empresas**, já aprovada, e o empresário entra no painel da empresa.
- **Negar** registra a recusa e abre uma mensagem respeitosa pronta no WhatsApp.
- O administrador continuará vendo o histórico e poderá filtrar por pendente, aceito, negado e acesso ativado.

## Fluxo

```text
Lista de Espera
      |
      +-- Aceitar --> WhatsApp com convite seguro --> Completar cadastro
      |                                              --> Empresa aprovada
      |                                              --> Painel da empresa
      |
      +-- Negar ----> WhatsApp com aviso pronto --> Registro mantido como negado
```

## Alterações no painel administrativo

- Substituir as ações atuais da lista por **Aceitar**, **Negar** e **Chamar**.
- Mostrar o novo status de cada cadastro e a data da decisão.
- Pedir confirmação antes de aceitar ou negar, evitando cliques acidentais.
- Manter busca, filtros, seleção em lote e exportação CSV; adaptar os filtros aos novos estados.
- Impedir novo aceite quando o convite já tiver sido usado.

## Ativação do empresário

- Criar uma página de ativação acessada somente pelo link recebido no WhatsApp.
- Preencher automaticamente empresa, CNPJ, responsável, WhatsApp e segmento já coletados.
- Solicitar os campos que ainda não existem na lista de espera, incluindo e-mail e senha.
- Criar a conta com papel normal de usuário, completar o perfil da empresa e marcar a empresa como aprovada.
- Encerrar o convite após o primeiro uso e direcionar o empresário ao painel.
- Exibir mensagens claras para convite inválido, vencido ou já utilizado.

## Avisos por WhatsApp

- Aceite: mensagem com nome do responsável, empresa, confirmação da aprovação e botão/link para ativar o acesso.
- Negativa: mensagem com nome do responsável, empresa e orientação para falar com a QBCAMP caso queira esclarecer ou regularizar o cadastro.
- As mensagens serão abertas no WhatsApp para revisão e envio manual pelo administrador.
- Não será necessário configurar envio de e-mail nesta etapa.

## Segurança e dados

- Guardar apenas uma versão protegida do código do convite; o link original não ficará exposto no banco.
- Permitir que somente administradores aceitem ou neguem inscrições.
- Permitir ativação apenas de inscrições aceitas, com convite válido e ainda não utilizado.
- Registrar decisão, ativação e vínculo com a nova conta para evitar cadastros duplicados.
- Manter os registros negados para histórico, sem apagá-los.

## Validação

- Testar aceite, abertura da mensagem e preenchimento automático pelo convite.
- Testar criação da conta, transferência para Empresas, aprovação e entrada no painel.
- Testar negativa e sua mensagem de WhatsApp.
- Testar convite reutilizado, inválido e tentativa sem permissão administrativa.
- Conferir a lista no computador e celular, além dos filtros e estados já existentes.
