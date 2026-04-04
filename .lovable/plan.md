

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
- Usar `supabase.auth.onAuthStateChange()` para gerenciar sessão
- Buscar role na tabela `profiles` (já existente)
- Remover localStorage/tokens manuais

### 3. Criar novas páginas
- **`/auth/callback`** — Captura redirects do Supabase (confirmação, recovery). Detecta `type=recovery` para redirecionar ao `/update-password`, senão redireciona por role.
- **`/update-password`** — Formulário nova senha com `supabase.auth.updateUser({ password })`

### 4. Atualizar páginas existentes
- **`LoginPage.tsx`** e **`StudentLoginPage.tsx`** — Usar Supabase Auth nativo
- Remover `ConfirmEmailPage.tsx`

### 5. Atualizar rotas (`App.tsx`) e compatibilidade (`api.ts`)

## Observações Técnicas
- O trigger `handle_new_user()` já cria perfis automaticamente — sem migração de banco
- Emails enviados automaticamente pelo Supabase Auth
- Contas admin existentes precisarão ser recriadas no Supabase Auth (migração única)

