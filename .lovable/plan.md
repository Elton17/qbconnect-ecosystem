# CPF e CNPJ opcionais no cadastro empresarial

## Objetivo
Permitir que uma empresa se cadastre, ative o convite e edite seu perfil mesmo sem CPF ou CNPJ. Os dois campos ficarão disponíveis e opcionais; quando preenchidos, serão validados e salvos.

## Alterações

1. **Dados empresariais**
   - Adicionar o campo opcional `CPF` aos cadastros de empresa, pré-cadastro/lista de espera, ativação por convite e edição do perfil.
   - Retirar a obrigatoriedade visual e de validação do `CNPJ` nesses mesmos locais.
   - Manter a consulta automática de dados empresariais somente quando um CNPJ completo for informado.
   - Aplicar máscara e validação de CPF/CNPJ apenas quando o respectivo campo tiver conteúdo.

2. **Banco de dados e ativação**
   - Adicionar `cpf` opcional aos registros de empresas e da lista de espera.
   - Preservar os cadastros atuais sem alterar seus documentos.
   - Atualizar a ativação por convite para transportar e salvar CPF e CNPJ opcionais.
   - Fazer a verificação de documento duplicado somente quando CPF ou CNPJ estiver preenchido, evitando conflito entre cadastros sem documento.

3. **Área administrativa**
   - Exibir e permitir editar CPF e CNPJ nas empresas cadastradas.
   - Atualizar busca, tabela e exportação da lista de espera para aceitar empresa, CPF ou CNPJ.
   - Mostrar um indicador neutro quando nenhum documento tiver sido informado.

4. **Textos relacionados**
   - Ajustar instruções do cadastro e da central de atendimento para não indicar CNPJ como obrigatório.

## Validação
- Testar cadastro sem documentos, somente com CPF, somente com CNPJ e com ambos.
- Testar documentos incompletos ou inválidos quando preenchidos.
- Testar ativação por convite e edição posterior do perfil nos quatro cenários.
- Confirmar busca e exportação no painel administrativo, além da preservação dos cadastros existentes.
- Validar em computador e celular.

## Detalhes técnicos
- A mudança será aditiva: novos campos opcionais, sem apagar ou transformar dados existentes.
- CPF e CNPJ continuarão tratados como dados privados, visíveis apenas ao titular e à administração.
- As regras de acesso e aprovação existentes serão preservadas.
