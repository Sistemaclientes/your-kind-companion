

# Plano: Corrigir Sistema de Autenticação e Emails

## Problema

O sistema de autenticação atual é **completamente customizado e inseguro**: senhas em texto puro nas tabelas `admins` e `alunos`, sem integração com Supabase Auth. Nenhum email é enviado de fato — nem para reset de senha, nem para confirmação de cadastro. A página `/confirmar-email` chama uma API inexistente.

## Solução

Migrar toda a autenticação para o **Supabase Auth nativo** (`supabase.auth.*`), que fornece automaticamente:
- Envio de emails (reset de senha e confirmação de cadastro)
- Hashing seguro de senhas
- Sessões JWT com tokens seguros
- Fluxo completo de recuperação de senha

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
- **`/auth/callback`** — Captura redirects do Supabase (confirmação de email, password recovery). Detecta `type=recovery` e redireciona para `/update-password`, senão redireciona conforme role do usuário
- **`/update-password`** — Formulário para definir nova senha com validação de tamanho e confirmação, usando `supabase.auth.updateUser({ password })`

### 4. Atualizar páginas existentes
- **`LoginPage.tsx`** — Substituir login e forgot password por chamadas Supabase Auth nativas
- **`StudentLoginPage.tsx`** — Substituir login, cadastro e forgot password por Supabase Auth
- **Remover `ConfirmEmailPage.tsx`** (substituída por `/auth/callback`)

### 5. Atualizar rotas em `App.tsx`
- Adicionar `/auth/callback` e `/update-password`
- Remover `/confirmar-email`

### 6. Atualizar `api.ts`
- Delegar rotas de auth para os novos métodos Supabase Auth

## Detalhes Técnicos
- O trigger `handle_new_user()` no banco já cria perfis e vincula `alunos`/`admins` no signup — nenhuma migração de banco necessária
- Emails de reset e confirmação são enviados automaticamente pelo Supabase Auth
- Contas admin existentes precisarão ser recriadas no Supabase Auth (migração única — será documentado)
- A tabela `profiles` já possui coluna `role` usada para determinar admin vs student

