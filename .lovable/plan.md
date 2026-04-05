

# Plano: Mostrar explicação da resposta correta

## O que será feito

Adicionar um bloco de explicação abaixo das alternativas de cada questão na tela de detalhes do resultado (`StudentResultDetailPage.tsx`), visível apenas quando o campo `explicacao` da pergunta estiver preenchido.

## Alteração

**Arquivo: `src/pages/StudentResultDetailPage.tsx`**

Após o bloco de alternativas (linha 231, após `</div>` que fecha `space-y-2 ml-11`), inserir um bloco condicional:

```tsx
{question.explicacao && (
  <div className="ml-11 mt-3 px-4 py-3 rounded-xl bg-surface-container-low border border-outline/50 text-sm text-on-surface-variant leading-relaxed">
    <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Explicação</span>
    {question.explicacao}
  </div>
)}
```

Isso exibirá um card sutil com o rótulo "Explicação" e o texto da explicação logo abaixo das alternativas de cada questão, somente quando houver conteúdo no campo `explicacao`.

Nenhuma alteração de banco de dados ou API necessária -- o campo `explicacao` já existe na tabela `perguntas` e já é retornado pela query da API.

