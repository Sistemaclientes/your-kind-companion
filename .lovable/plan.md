

# Plano: Ver acertos/erros + ocultar provas aprovadas

## O que já funciona
A tela de **detalhes do resultado** (`StudentResultDetailPage`) já mostra cada questão com marcação verde (acertou) e vermelha (errou), incluindo a resposta correta destacada.

## Alterações necessárias

### 1. `src/pages/StudentExamsListPage.tsx` — Usar resultados do banco de dados

A lista de provas disponíveis usa `localStorage` para saber quais provas foram aprovadas. Isso não funciona entre dispositivos e pode ficar desatualizado.

**Correção:** Na linha 28, substituir:
```
Promise.resolve(JSON.parse(localStorage.getItem('local_resultados') || '[]'))
```
por:
```
api.get('/resultados')
```

E na linha 31, remover o `.filter((r: any) => r.email_aluno === parsed.email)` — a API já retorna apenas os resultados do aluno logado. O resultado fica:
```
setResults(allResults);
```

O filtro `pontuacao >= 70` na linha 41 já existe e continuará funcionando — provas aprovadas desaparecem da lista automaticamente.

### 2. `src/pages/StudentResultPage.tsx` — Botão "Ver Detalhes" proeminente

Após a prova, o botão para ver questões acertadas/erradas está escondido. Precisamos torná-lo visível.

**Correção:** Substituir o bloco do "Certificado de Conclusão" (linhas 169-209) por um card proeminente:
- Ícone Eye grande (16x16) com fundo primary/10
- Título: "Ver Detalhes da Prova"
- Subtítulo: "Veja quais questões você acertou e errou, com as respostas corretas destacadas."
- Botão primary "Ver Questões" que navega para `/aluno/resultado/${result.slug}`
- Card com borda `border-2 border-primary/20 hover:border-primary/40`
- Abaixo, manter botões "Dashboard" e "Nova Prova" como secundários

### Nenhuma alteração de banco de dados necessária.

### Resultado
1. Aluno finaliza prova → vê nota → clica "Ver Detalhes da Prova" → vê cada questão com acerto/erro
2. Aluno volta à lista de provas → prova aprovada (>=70%) não aparece mais
3. Funciona entre dispositivos pois usa dados do Supabase

