

# Plano: Corrigir Sistema de Autenticação e Emails

## Problema

O sistema de autenticação atual é **completamente customizado e inseguro**: senhas em texto puro nas tabelas `admins` e `alunos`, sem integração com Supabase Auth. Nenhum email é enviado — nem para reset de senha, nem para confirmação de cadastro. A página `/confirmar-email` chama uma API que não existe.

## Solução

Migrar toda a autenticação para o **Supabase Auth nativo** (`supabase.auth.*`), que fornece automaticamente envio de emails (reset e confirmação), hashing seguro, sessões JWT e tokens seguros.

## Etapas

### 1. Reescrever `auth.service.ts`
- Login (admin/aluno): `supabase.auth.signInWithPassword()`
- Cadastro aluno: `supabase.auth.signUp()` com metadata (nome, telefone, cpf)
- Esqueci senha: `supabase.auth.resetPasswordForEmail()` com `redirectTo` para `/update-password`
- Logout: `supabase.auth.signOut()`

### 2. Reescrever `authStore.ts`
- Usar `supabase.auth.onAuthStateChange()` para gerenciar sessão automaticamente
- Buscar role na tabela `profiles` (já existente com coluna `role`)
- Remover gerenciamento manual de localStorage/tokens

### 3. Criar novas páginas
- **`/auth/callback`** — Captura redirects do Supabase (confirmação de email, password recovery). Detecta `type=recovery` para redirecionar ao `/update-password`, senão redireciona conforme role.
- **`/update-password`** — Formulário para definir nova senha com validação, usando `supabase.auth.updateUser({ password })`

### 4. Atualizar páginas existentes
- **`LoginPage.tsx`** — Substituir login e forgot password por Supabase Auth
- **`StudentLoginPage.tsx`** — Substituir login, cadastro e forgot password por Supabase Auth
- **Remover `ConfirmEmailPage.tsx`** (substituída por `/auth/callback`)

### 5. Atualizar rotas em `App.tsx`
- Adicionar `/auth/callback` e `/update-password`
- Remover `/confirmar-email`

### 6. Atualizar `api.ts` para delegar aos novos métodos

## Observações Técnicas
- O trigger `handle_new_user()` no banco já cria perfis automaticamente e vincula `alunos`/`admins` — sem migração de banco necessária
- Emails de reset e confirmação são enviados automaticamente pelo Supabase Auth
- Contas admin existentes precisarão ser recriadas no Supabase Auth (migração única — documentado para o usuário)
- A tabela `profiles` já possui coluna `role` para determinar admin vs student

