

# Plano de Segurança — Hardening Completo do Sistema

## Situação Atual

Após análise detalhada do banco e código:

**Já feito em migrações anteriores:** extensão `pgcrypto` no schema `extensions`, coluna `password_hash` em `alunos`, funções `hash_password()` e `login_user()` com SECURITY DEFINER, RLS ativado em `alunos` e `admins`.

**Ainda vulnerável:**
- 0 de 8 alunos tem `password_hash` preenchido — senhas em texto puro na coluna `senha`
- Admin com senha visível no banco
- Código front-end compara senhas com `toLowerCase()` sem hash
- Função `login_aluno` compara `senha` em texto puro
- Políticas RLS duplicadas e permissivas (`USING (true)`, `WITH CHECK (true)`)
- Política de admins permite acesso quando `auth.uid() IS NULL`
- Storage sem políticas restritivas
- "Lembrar-me" salva senha em texto puro no localStorage

---

## Execução em 4 Etapas

### Etapa 1 — Migração SQL (via ferramenta de migração)

1. Adicionar `password_hash` à tabela `admins`
2. Migrar senhas existentes de `alunos` e `admins` para bcrypt usando `extensions.crypt()`
3. Atualizar função `login_aluno` para validar via bcrypt
4. Criar função `login_admin` como RPC segura com bcrypt
5. Criar função `register_aluno` que já faz hash da senha
6. Criar função `change_admin_password` que valida e faz hash
7. Remover políticas RLS inseguras/duplicadas:
   - `Permitir consulta pública de existência de email` (USING true)
   - `Auto-registro público de alunos` (WITH CHECK true)
   - `admin only access` (duplicada/genérica)
   - `select own user`, `update own user`, `delete own user` (duplicadas)
   - Corrigir `Visualização de admins` removendo condição `auth.uid() IS NULL`
8. Criar políticas de storage para `avatars` e `banners`

### Etapa 2 — Atualizar código de autenticação

**`src/services/auth.service.ts`:**
- `loginAdmin()`: trocar SELECT direto + comparação texto puro por chamada RPC `login_admin`
- `registerStudent()`: usar RPC `register_aluno` em vez de insert direto com senha em texto puro
- `changeAdminPassword()`: usar RPC `change_admin_password`

**`src/services/admin.service.ts`:**
- Criar admin com senha hashada via RPC

### Etapa 3 — Remover "lembrar senha" inseguro

**`src/pages/LoginPage.tsx`:** parar de salvar `admin_remembered_pw` no localStorage, manter apenas email

**`src/pages/StudentLoginPage.tsx`:** idem para `student_remembered`

### Etapa 4 — Limpeza

- Verificar que nenhuma query do front-end pede `senha` ou `password_hash`
- Nota: `is_correta` e retornado nas alternativas durante a prova — alunos podem ver respostas corretas no DevTools (risco de cola)

---

## Alertas Importantes

- A coluna `senha` sera mantida temporariamente ate confirmar que o login com bcrypt funciona
- As politicas `WITH CHECK (true)` em `resultados` e `respostas_aluno` precisam permanecer porque o sistema usa autenticacao customizada (sem `auth.users`) — alunos nao tem `auth.uid()`
- O campo `is_correta` nas alternativas e enviado ao front durante a prova

