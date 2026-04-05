

# Plano: Mostrar explicação da resposta correta

## O que será feito

Adicionar um bloco de explicação abaixo das alternativas de cada questão na tela de detalhes do resultado, visível apenas quando o campo `explicacao` da pergunta estiver preenchido.

## Alteração

**Arquivo: `src/pages/StudentResultDetailPage.tsx`**

Após o bloco de alternativas de cada questão (linha 231), inserir um card condicional com rótulo "Explicação" e o texto, usando estilo sutil (`bg-surface-container-low`, borda, texto `on-surface-variant`).

Nenhuma alteração de banco de dados ou API necessária -- o campo `explicacao` já existe na tabela `perguntas` e já é retornado pela query.

