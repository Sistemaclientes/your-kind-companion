
# Plano: Revisão de questões + ocultar provas aprovadas

## Contexto

Após análise, identifiquei dois problemas principais:

1. **Listagem de provas disponíveis** usa `localStorage` (`local_resultados`) para filtrar provas aprovadas, o que é frágil e não persiste entre dispositivos/navegadores. Deve usar os resultados reais do banco de dados via API `/resultados`.

2. **A página de detalhes do resultado** (`StudentResultDetailPage.tsx`) já mostra acertos/erros por questão corretamente. A tela de resultado imediato (`StudentResultPage.tsx`) mostra a nota mas sem detalhes por questão — o aluno precisa clicar "Ver Detalhes" para ver questão a questão.

## Alterações planejadas

### 1. Corrigir `StudentExamsListPage.tsx` — usar resultados do banco de dados
- Substituir a leitura de `local_resultados` do localStorage por chamada à API `/resultados` (que busca do Supabase)
- Filtrar provas onde o aluno foi aprovado (pontuação >= 70) usando dados reais do banco
- Isso garante que provas aprovadas desapareçam independente do dispositivo

### 2. Corrigir `StudentDashboardPage.tsx` — garantir consistência
- Verificar se o dashboard também filtra corretamente provas aprovadas (se exibir provas disponíveis)

### 3. Redirecionar automaticamente para detalhes após finalizar prova
- Na `StudentResultPage.tsx`, após mostrar nota/status, incluir botão "Ver Detalhes" mais proeminente ou redirecionar direto para `StudentResultDetailPage` onde o aluno vê questão por questão (acertos/erros)

## Detalhes técnicos

**Arquivo: `src/pages/StudentExamsListPage.tsx`**
- Trocar `Promise.resolve(JSON.parse(localStorage.getItem('local_resultados') || '[]'))` por `api.get('/resultados')`
- Ajustar o filtro de `approvedExamIds` para usar `r.prova_id` dos resultados do banco

**Arquivo: `src/pages/StudentResultPage.tsx`**
- Tornar o botão "Ver Detalhes" mais visível/proeminente para que o aluno veja facilmente quais questões acertou ou errou

Nenhuma alteração de banco de dados necessária — a funcionalidade de detalhes por questão já existe.
