

# Plano: Corrigir Sistema de Autenticacao e Emails

## Problema

O sistema de autenticacao atual e completamente customizado e inseguro: senhas armazenadas em texto puro nas tabelas `admins` e `alunos`, sem integracao com Supabase Auth. Nenhum email e de fato enviado -- nem para reset de senha, nem para confirmacao de cadastro. A pagina `/confirmar-email` chama uma API que nao existe.

## Solucao

Migrar toda a autenticacao para o **Supabase Auth nativo** (`supabase.auth.*`), que fornece automaticamente envio de emails (reset e confirmacao), hashing seguro, sessoes JWT e tokens seguros.

## Etapas de Implementacao

### 1. Reescrever `auth.service.ts`
- Login (admin/aluno): `supabase.auth.signInWithPassword()`
- Cadastro aluno: `supabase.auth.signUp()` com metadata (nome, telefone, cpf)
- Esqueci senha: `supabase.auth.resetPasswordForEmail()` com `redirectTo` para `/update-password`
- Logout: `supabase.auth.signOut()`

### 2. Reescrever `authStore.ts`
- Usar `supabase.auth.onAuthStateChange()` ANTES de `getSession()`
- Buscar role na tabela `profiles` (ja existente com coluna `role`)
- Remover gerenciamento manual de localStorage/tokens

### 3. Criar novas paginas
- `/auth/callback` -- Captura redirects do Supabase (confirmacao de email, recovery). Detecta `type=recovery` para redirecionar ao `/update-password`, senao redireciona conforme role
- `/update-password` -- Formulario nova senha com validacao, usando `supabase.auth.updateUser({ password })`

### 4. Atualizar paginas existentes
- `LoginPage.tsx` -- Usar `supabase.auth.signInWithPassword()` e `resetPasswordForEmail()`. Remover view inline de reset
- `StudentLoginPage.tsx` -- Substituir login, cadastro e forgot password por Supabase Auth
- Remover `ConfirmEmailPage.tsx`

### 5. Atualizar rotas em `App.tsx`
- Adicionar `/auth/callback` e `/update-password`
- Remover `/confirmar-email`

### 6. Atualizar `api.ts` para delegar aos novos metodos

## Detalhes Tecnicos
- O trigger `handle_new_user()` ja cria perfis automaticamente -- sem migracao de banco
- Emails enviados automaticamente pelo Supabase Auth
- Contas admin existentes precisarao ser recriadas no Supabase Auth (migracao unica)
- Tabela `profiles` ja possui coluna `role` para admin vs student

