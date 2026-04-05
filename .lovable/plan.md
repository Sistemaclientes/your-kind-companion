

# Plano de Segurança — Hardening Completo do Sistema

## Situação Atual

Após análise detalhada do banco e código:

**Já feito:** extensão `pgcrypto` no schema `extensions`, coluna `password_hash` em `alunos`, funções `hash_password()` e `login_user()` com SECURITY DEFINER, RLS ativado.

**Ainda vulnerável:**
- 0 de 8 alunos tem `password_hash` — senhas em texto puro
- Admin com senha visível no banco
- Código compara senhas sem hash
- `login_aluno` compara texto puro
- Políticas RLS permissivas (`USING true`, `WITH CHECK true`)
- Storage sem restrições
- "Lembrar-me" salva senha em texto puro no localStorage

---

## Execução em 4 Etapas

### Etapa 1 — Migração SQL

1. Adicionar `password_hash` à tabela `admins`
2. Migrar senhas existentes de `alunos` e `admins` para bcrypt
3. Atualizar `login_aluno` para validar via bcrypt
4. Criar `login_admin` como RPC segura com bcrypt
5. Remover políticas RLS inseguras/duplicadas: `Permitir consulta pública de existência de email`, `Auto-registro público de alunos`, `admin only access`, `select own user`, `update own user`, `delete own user`, corrigir `Visualização de admins`
6. Criar políticas de storage para `avatars` e `banners`

### Etapa 2 — Atualizar código de autenticação

- `auth.service.ts`: trocar SELECT direto por RPC `login_admin`, usar hash no registro e troca de senha
- `admin.service.ts`: hash da senha padrão ao criar admin

### Etapa 3 — Remover "lembrar senha" inseguro

- `LoginPage.tsx` e `StudentLoginPage.tsx`: salvar apenas email, nunca senha

### Etapa 4 — Limpeza

- Verificar que nenhuma query expõe `senha` ou `password_hash`
- Confirmar exposição de `is_correta` ao front-end durante prova

---

## Alertas

- Coluna `senha` será mantida temporariamente até confirmar que bcrypt funciona
- Políticas `WITH CHECK (true)` em `resultados` e `respostas_aluno` precisam permanecer (autenticação customizada sem `auth.users`)
- Campo `is_correta` é retornado ao front durante a prova — alunos podem ver respostas no DevTools

