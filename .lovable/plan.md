

# Plano: Corrigir Sistema de Autenticacao e Emails

## Problema Identificado

O sistema de autenticacao atual e completamente customizado e inseguro:
- Senhas armazenadas em **texto puro** nas tabelas `admins` e `alunos`
- Nenhuma integracao com Supabase Auth
- **Nenhum email e enviado** -- nem para reset de senha, nem para confirmacao de cadastro
- A pagina `/confirmar-email` chama uma API que nao existe
- O forgot password do aluno nao faz nada (apenas muda state local)

## Solucao

Migrar toda a autenticacao para o **Supabase Auth nativo** (`supabase.auth.*`), que fornece automaticamente:
- Envio de emails (reset de senha e confirmacao de cadastro)
- Hashing seguro de senhas
- Sessoes JWT com refresh tokens
- Links seguros com tokens temporarios

## Etapas de Implementacao

### 1. Reescrever `auth.service.ts`
Substituir todas as operacoes de auth manual por chamadas Supabase Auth nativas:
- Login: `supabase.auth.signInWithPassword()`
- Cadastro: `supabase.auth.signUp()` com metadata (nome, telefone, cpf)
- Esqueci senha: `supabase.auth.resetPasswordForEmail()` com `redirectTo` apontando para `/update-password`
- Logout: `supabase.auth.signOut()`

### 2. Reescrever `authStore.ts`
- Usar `supabase.auth.onAuthStateChange()` como listener de sessao (configurado ANTES de `getSession()`)
- Buscar role na tabela `profiles` (ja existe com coluna `role`)
- Remover todo gerenciamento manual de localStorage e tokens falsos

### 3. Criar pagina `/auth/callback`
Captura os redirects do Supabase Auth (confirmacao de email, password recovery). Detecta `type=recovery` na URL hash para redirecionar ao `/update-password`; caso contrario, redireciona baseado na role do usuario.

### 4. Criar pagina `/update-password`
Formulario para definir nova senha com:
- Validacao (minimo 6 caracteres, confirmacao)
- Loading states e feedback visual
- `supabase.auth.updateUser({ password })`

### 5. Atualizar `LoginPage.tsx` e `StudentLoginPage.tsx`
- Substituir login, cadastro e forgot password por chamadas Supabase Auth
- Remover view inline de reset de senha do LoginPage (agora em `/update-password`)

### 6. Atualizar rotas em `App.tsx`
- Adicionar `/auth/callback` e `/update-password`
- Remover `/confirmar-email` e `ConfirmEmailPage.tsx`

### 7. Atualizar `api.ts`
- Atualizar camada de compatibilidade para delegar aos novos metodos

## Detalhes Tecnicos
- O trigger `handle_new_user()` ja cria perfis automaticamente e vincula `alunos`/`admins` -- **nenhuma migracao de banco necessaria**
- Emails sao enviados automaticamente pelo Supabase Auth (templates padrao)
- Contas admin existentes precisarao ser recriadas no Supabase Auth (migracao unica -- sera documentado)
- A tabela `profiles` ja possui coluna `role` para determinar admin vs student

