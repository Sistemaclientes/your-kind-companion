

# Plano: Ver acertos/erros + ocultar provas aprovadas

## O que já funciona
A tela de **detalhes do resultado** (`StudentResultDetailPage`) já mostra cada questão com marcação verde (acertou) e vermelha (errou), incluindo a resposta correta destacada. Essa funcionalidade está pronta.

## O que precisa ser corrigido

### 1. Lista de provas disponíveis — usar dados reais do banco

**Arquivo:** `src/pages/StudentExamsListPage.tsx`

**Problema:** A filtragem de provas aprovadas usa `localStorage` (`local_resultados`), que não persiste entre dispositivos e pode ficar desatualizado.

**Correção:**
- Substituir `Promise.resolve(JSON.parse(localStorage.getItem('local_resultados') || '[]'))` por `api.get('/resultados')` (que busca resultados reais do Supabase)
- Remover o filtro por email (a API já retorna apenas os resultados do aluno logado)
- O filtro `pontuacao >= 70` já existe e continuará funcionando — provas aprovadas desaparecem da lista

### 2. Tela de resultado — facilitar acesso aos detalhes por questão

**Arquivo:** `src/pages/StudentResultPage.tsx`

**Problema:** Após finalizar a prova, o botão "Ver Detalhes" fica pouco visível dentro de um card genérico. O aluno não percebe que pode ver questão por questão.

**Correção:**
- Adicionar um card/botão proeminente logo abaixo dos cards de nota/acertos/status
- Texto: "Ver Detalhes da Prova — Veja quais questões você acertou e errou"
- Estilo: card com borda primary, ícone Eye grande, botão "Ver Questões"
- Remover o card antigo de "Certificado de Conclusão" que misturava ações

### Resultado esperado
1. Aluno finaliza prova → vê nota → clica "Ver Detalhes" → vê cada questão com acerto/erro
2. Aluno volta à lista de provas → prova aprovada (>=70%) não aparece mais
3. Funciona entre dispositivos porque usa dados do banco de dados

### Nenhuma alteração de banco de dados necessária.

