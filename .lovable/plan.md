

# Plano: Mostrar explicação da resposta correta

## O que será feito

Adicionar um bloco de explicação abaixo das alternativas de cada questão na tela de detalhes do resultado (`StudentResultDetailPage.tsx`), visível apenas quando o campo `explicacao` da pergunta estiver preenchido.

## Alteração

**Arquivo: `src/pages/StudentResultDetailPage.tsx`**

Após o bloco de alternativas de cada questão (linha 231), inserir um card condicional:
- Rótulo "Explicação" em texto pequeno e destaque primary
- Texto da explicação em estilo sutil (fundo `surface-container-low`, borda, texto `on-surface-variant`)
- Aparece somente quando `question.explicacao` tiver conteúdo

Nenhuma alteração de banco de dados ou API necessária — o campo `explicacao` já existe na tabela `perguntas` e já é retornado pela query.

