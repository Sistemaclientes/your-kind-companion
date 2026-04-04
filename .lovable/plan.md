

# Plano: Corrigir Sistema de Autenticacao e Emails

## Problema

O sistema de autenticacao atual e completamente customizado e inseguro: senhas armazenadas em texto puro nas tabelas `admins` e `alunos`, sem integracao com Supabase Auth. Nenhum email e de fato enviado -- nem para reset de senha, nem para confirmacao de cadastro. A pagina `/confirmar-email` chama uma API que nao existe.

## Solucao

Migrar toda a autenticacao para o **Supabase Auth nativo** (`supabase.auth.*`), que fornece automaticamente:
- Envio de emails (reset de senha e confirmacao de cadastro)
- Hashing seguro de senhas (bcrypt)
- Sessoes JWT com refresh tokens
- Fluxo completo de recuperacao de senha com links seguros

## Etapas de Implementacao

### 1. Reescrever `auth.service.ts` -- Usar Supabase Auth nativo
- Login (admin/aluno): `supabase.auth.signInWithPassword()`
- Cadastro aluno: `supabase.auth.signUp()` com metadata (nome, telefone, cpf)
- Esqueci senha: `supabase.auth.resetPasswordForEmail()` com `redirectTo` apontando para `/update-password`
- Logout: `supabase.auth.signOut()`

### 2. Reescrever `authStore.ts` -- Sessao baseada em Supabase
- Configurar `supabase.auth.onAuthStateChange()` ANTES de chamar `getSession()`
- Buscar role do usuario na tabela `profiles` (ja existente com coluna `role`)
- Remover todo gerenciamento manual de localStorage e tokens falsos

### 3. Criar novas paginas
- **`/auth/callback`** -- Pagina que captura os redirects do Supabase Auth (confirmacao de email, password recovery). Detecta `type=recovery` na URL hash para redirecionar ao `/update-password`; caso contrario, redireciona baseado na role (admin -> `/admin/dashboard`, student -> `/student/dashboard`)
- **`/update-password`** -- Formulario para definir nova senha com validacao (minimo 6 caracteres, confirmacao de senha), usando `supabase.auth.updateUser({ password })`. Inclui loading states, feedback visual de sucesso/erro

### 4. Atualizar paginas existentes
- **`LoginPage.tsx`** -- Substituir `api.login()` por `supabase.auth.signInWithPassword()`. Substituir forgot password manual por `supabase.auth.resetPasswordForEmail()`. Remover a view inline de reset de senha (agora e pagina separada `/update-password`)
- **`StudentLoginPage.tsx`** -- Substituir login, cadastro e forgot password por chamadas Supabase Auth nativas
- **Remover `ConfirmEmailPage.tsx`** (funcionalidade absorvida por `/auth/callback`)

### 5. Atualizar rotas em `App.tsx`
- Adicionar rotas `/auth/callback` e `/update-password`
- Remover rota `/confirmar-email`
- Adicionar redirect legado de `/confirmar-email` para `/auth/callback`

### 6. Atualizar `api.ts`
- Atualizar a camada de compatibilidade para delegar aos novos metodos Supabase Auth

## Detalhes Tecnicos
- O trigger `handle_new_user()` ja existente no banco cria perfis automaticamente e vincula `alunos`/`admins` no signup -- **nenhuma migracao de banco necessaria**
- Emails sao enviados automaticamente pelo Supabase Auth (templates padrao)
- Contas admin existentes na tabela `admins` precisarao ser recriadas no Supabase Auth (migracao unica -- sera documentado para o usuario)
- A tabela `profiles` ja possui coluna `role` que sera usada para determinar admin vs student

