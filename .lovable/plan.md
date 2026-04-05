

# Plano: Mostrar explicação da resposta correta

## O que será feito

Na tela de detalhes do resultado (`StudentResultDetailPage.tsx`), adicionar um bloco de explicação abaixo das alternativas de cada questão, visível apenas quando o campo `explicacao` estiver preenchido.

## Alteração

**Arquivo: `src/pages/StudentResultDetailPage.tsx`**

Após o bloco de alternativas de cada questão (linha 231), inserir um card condicional:
- Ícone de lâmpada (Lightbulb do Lucide) + rótulo "Explicação" em destaque primary
- Texto da explicação com estilo sutil (fundo `surface-container-low`, borda, texto `on-surface-variant`)
- Aparece somente quando `question.explicacao` tiver conteúdo

## Sem alteração de banco de dados

O campo `explicacao` já existe na tabela `perguntas` e já é retornado pela query usada nesta página.

