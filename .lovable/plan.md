

# Plano: Corrigir Sistema de Autenticação e Emails

## Problema

O sistema de autenticação atual é **completamente customizado e inseguro**: senhas em texto puro, sem integração com Supabase Auth, nenhum email é de fato enviado (nem reset de senha, nem confirmação de cadastro). A página `/confirmar-email` chama uma API inexistente.

## Solução

Migrar toda a autenticação para o **Supabase Auth nativo**, que fornece automaticamente: envio de emails (reset, confirmação), hashing seguro, sessões JWT e tokens seguros.

## Etapas de Implementação

### 1. Reescrever `auth.service.ts`
- Login (admin e aluno): `supabase.auth.signInWithPassword()`
- Cadastro aluno: `supabase.auth.signUp()` com metadata
- Esqueci senha: `supabase.auth.resetPasswordForEmail()` com `redirectTo` para `/update-password`
- Logout: `supabase.auth.signOut()`

### 2. Reescrever `authStore.ts`
- Usar `supabase.auth.onAuthStateChange()` para gerenciar sessão
- Buscar role na tabela `profiles` (já existente)
- Remover localStorage manual de tokens

### 3. Criar novas páginas
- **`/auth/callback`** — Captura redirects do Supabase (confirmação de email, recovery)
- **`/update-password`** — Formulário para nova senha com `supabase.auth.updateUser()`

### 4. Atualizar páginas existentes
- **`LoginPage.tsx`** e **`StudentLoginPage.tsx`** — Usar Supabase Auth nativo
- Remover `ConfirmEmailPage.tsx`

### 5. Atualizar rotas em `App.tsx`
- Adicionar `/auth/callback` e `/update-password`
- Remover `/confirmar-email`

### 6. Atualizar `api.ts`
- Delegar rotas de auth aos novos métodos

## Observações
- O trigger `handle_new_user()` já cria profiles automaticamente — sem migração de banco
- Emails são enviados automaticamente pelo Supabase Auth
- Contas admin existentes precisarão ser recriadas no Supabase Auth (migração única)

