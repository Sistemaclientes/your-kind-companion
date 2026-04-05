

# Plano: Revisão de questões + ocultar provas aprovadas

## O que já funciona
- A tela de **detalhes do resultado** (`StudentResultDetailPage`) já mostra questão por questão com acertos (verde) e erros (vermelho) — essa funcionalidade está pronta.

## O que precisa ser corrigido

### 1. `src/pages/StudentExamsListPage.tsx` — Usar resultados do banco de dados

**Problema:** A lista de provas disponíveis usa `localStorage` (`local_resultados`) para saber quais provas o aluno já passou. Isso é frágil e não funciona entre dispositivos.

**Correção:** Substituir a leitura do localStorage por chamada à API real:

- Linha 26-28: Trocar `Promise.resolve(JSON.parse(localStorage.getItem('local_resultados') || '[]'))` por `api.get('/resultados')`
- Linha 31: Remover o filtro por email (a API já retorna só os resultados do aluno logado)
- O filtro `approvedExamIds` na linha 41 já funciona corretamente com `pontuacao >= 70`

### 2. `src/pages/StudentResultPage.tsx` — Facilitar acesso aos detalhes

**Problema:** Após finalizar a prova, o botão "Ver Detalhes" está escondido dentro de um card. O aluno precisa encontrá-lo para ver quais questões acertou/errou.

**Correção:** Tornar o botão "Ver Detalhes" mais proeminente:
- Mover o botão "Ver Detalhes" para logo abaixo dos cards de resultado (nota, acertos, status)
- Usar estilo `btn-primary` em vez de `btn-secondary` para o botão de detalhes
- Adicionar texto explicativo: "Veja quais questões você acertou e errou"

### Nenhuma alteração no banco de dados é necessária.
