

# Plano: Corrigir Sistema de Autenticacao e Emails

## Problema

O sistema de autenticacao atual e completamente customizado e inseguro: senhas em texto puro nas tabelas `admins` e `alunos`, sem integracao com Supabase Auth. Nenhum email e enviado -- nem para reset de senha, nem para confirmacao de cadastro. A pagina `/confirmar-email` chama uma API inexistente.

## Solucao

Migrar toda a autenticacao para o **Supabase Auth nativo** (`supabase.auth.*`), que fornece automaticamente envio de emails (reset e confirmacao), hashing seguro, sessoes JWT e tokens seguros.

## Etapas de Implementacao

### 1. Reescrever `auth.service.ts`
- Login (admin/aluno): `supabase.auth.signInWithPassword()`
- Cadastro aluno: `supabase.auth.signUp()` com metadata (nome, telefone, cpf)
- Esqueci senha: `supabase.auth.resetPasswordForEmail()` com `redirectTo` para `/update-password`
- Logout: `supabase.auth.signOut()`

### 2. Reescrever `authStore.ts`
- Usar `supabase.auth.onAuthStateChange()` como listener principal (configurado ANTES de `getSession()`)
- Buscar role na tabela `profiles` (ja existente com coluna `role`)
- Remover gerenciamento manual de localStorage/tokens

### 3. Criar novas paginas
- **`/auth/callback`** -- Captura redirects do Supabase (confirmacao de email, password recovery). Detecta `type=recovery` na URL hash para redirecionar ao `/update-password`, senao redireciona conforme role do usuario (admin -> `/admin/dashboard`, student -> `/student/dashboard`)
- **`/update-password`** -- Formulario para definir nova senha com validacao (min 6 chars, confirmacao), usando `supabase.auth.updateUser({ password })`. Inclui loading states e feedback visual

### 4. Atualizar paginas existentes
- **`LoginPage.tsx`** -- Substituir `api.login()` por `supabase.auth.signInWithPassword()`. Substituir forgot password por `supabase.auth.resetPasswordForEmail()`. Remover a view inline de reset (agora em `/update-password`)
- **`StudentLoginPage.tsx`** -- Substituir login por `supabase.auth.signInWithPassword()`. Substituir cadastro por `supabase.auth.signUp()`. Substituir forgot password por `supabase.auth.resetPasswordForEmail()`
- **Remover `ConfirmEmailPage.tsx`** (substituida por `/auth/callback`)

### 5. Atualizar rotas em `App.tsx`
- Adicionar `/auth/callback` e `/update-password`
- Remover `/confirmar-email`
- Manter redirects legados

### 6. Atualizar `api.ts`
- Delegar rotas de auth para os novos metodos Supabase Auth

## Detalhes Tecnicos
- O trigger `handle_new_user()` no banco ja cria perfis automaticamente e vincula `alunos`/`admins` -- sem migracao de banco necessaria
- Emails de reset e confirmacao sao enviados automaticamente pelo Supabase Auth
- Contas admin existentes precisarao ser recriadas no Supabase Auth (migracao unica -- sera documentado)
- A tabela `profiles` ja possui coluna `role` para determinar admin vs student

