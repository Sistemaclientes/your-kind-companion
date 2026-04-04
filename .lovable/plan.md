

# Plano: Corrigir Sistema de Autenticacao e Emails

## Problema Identificado

O sistema de autenticacao atual e completamente customizado e inseguro:
- Senhas armazenadas em **texto puro** nas tabelas `admins` e `alunos`
- Sem integracao com Supabase Auth
- **Nenhum email e enviado** -- nem para reset de senha, nem para confirmacao de cadastro
- A pagina `/confirmar-email` chama uma API que nao existe
- O forgot password do aluno nao faz nada (apenas muda state local sem enviar email)

## Solucao

Migrar toda a autenticacao para o **Supabase Auth nativo** (`supabase.auth.*`), que fornece automaticamente envio de emails, hashing seguro, sessoes JWT e tokens seguros.

## Etapas de Implementacao

### 1. Reescrever `auth.service.ts`
- Login (admin/aluno): `supabase.auth.signInWithPassword()`
- Cadastro aluno: `supabase.auth.signUp()` com metadata (nome, telefone, cpf)
- Esqueci senha: `supabase.auth.resetPasswordForEmail()` com `redirectTo` para `/update-password`
- Logout: `supabase.auth.signOut()`

### 2. Reescrever `authStore.ts`
- Usar `supabase.auth.onAuthStateChange()` como listener (configurado ANTES de `getSession()`)
- Buscar role na tabela `profiles` (ja existente com coluna `role`)
- Remover gerenciamento manual de localStorage/tokens

### 3. Criar pagina `/auth/callback`
- Captura redirects do Supabase (confirmacao de email, password recovery)
- Detecta `type=recovery` na URL hash para redirecionar ao `/update-password`
- Caso contrario, redireciona conforme role (admin ou student)

### 4. Criar pagina `/update-password`
- Formulario nova senha com validacao (min 6 chars, confirmacao)
- Usa `supabase.auth.updateUser({ password })`
- Loading states e feedback visual

### 5. Atualizar `LoginPage.tsx` e `StudentLoginPage.tsx`
- Substituir login, cadastro e forgot password por Supabase Auth nativo
- Remover view inline de reset do LoginPage

### 6. Atualizar rotas em `App.tsx`
- Adicionar `/auth/callback` e `/update-password`
- Remover `/confirmar-email` e `ConfirmEmailPage.tsx`

### 7. Atualizar `api.ts` para delegar aos novos metodos

## Detalhes Tecnicos
- O trigger `handle_new_user()` ja cria perfis automaticamente -- sem migracao de banco
- Emails enviados automaticamente pelo Supabase Auth
- Contas admin existentes precisarao ser recriadas no Supabase Auth (sera documentado)
- Tabela `profiles` ja possui coluna `role` para admin vs student

