

# Plano: Corrigir Sistema de Autenticação e Emails

## Problema

O sistema de autenticação atual é **completamente customizado e inseguro**: senhas em texto puro, sem integração com Supabase Auth, nenhum email é de fato enviado (nem reset de senha, nem confirmação de cadastro). A página `/confirmar-email` chama uma API inexistente.

## Solução

Migrar toda a autenticação para o **Supabase Auth nativo**, que fornece automaticamente: envio de emails (reset, confirmação), hashing seguro, sessões JWT e tokens seguros.

## Etapas de Implementação

### 1. Reescrever `auth.service.ts`
- Login (admin e aluno): `supabase.auth.signInWithPassword()`
- Cadastro aluno: `supabase.auth.signUp()` com metadata (nome, telefone, cpf)
- Esqueci senha: `supabase.auth.resetPasswordForEmail()` com `redirectTo` para `/update-password`
- Logout: `supabase.auth.signOut()`

### 2. Reescrever `authStore.ts`
- Usar `supabase.auth.onAuthStateChange()` para gerenciar sessão automaticamente
- Buscar role na tabela `profiles` (já existente com coluna `role`)
- Remover gerenciamento manual de localStorage/tokens

### 3. Criar novas páginas
- **`/auth/callback`** — Captura redirects do Supabase (confirmação de email, password recovery). Detecta `type=recovery` e redireciona para `/update-password`, senão redireciona conforme role.
- **`/update-password`** — Formulário para definir nova senha com validação, usando `supabase.auth.updateUser({ password })`

### 4. Atualizar páginas existentes
- **`LoginPage.tsx`** — Substituir login e forgot password por chamadas Supabase Auth
- **`StudentLoginPage.tsx`** — Substituir login, cadastro e forgot password por Supabase Auth
- **Remover `ConfirmEmailPage.tsx`** (substituída por `/auth/callback`)

### 5. Atualizar rotas em `App.tsx`
- Adicionar `/auth/callback` e `/update-password`
- Remover `/confirmar-email`

### 6. Atualizar `api.ts`
- Delegar rotas de auth para os novos métodos Supabase Auth

## Detalhes Técnicos
- O trigger `handle_new_user()` no banco já cria perfis e vincula `alunos`/`admins` no signup — nenhuma migração necessária
- Emails de reset e confirmação são enviados automaticamente pelo Supabase Auth
- Contas admin existentes precisarão ser recriadas no Supabase Auth (migração única)
- Nenhuma alteração de banco de dados é necessária

