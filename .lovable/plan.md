

# Plano: Corrigir Sistema de Autenticação e Emails

## Problemas Atuais

O sistema de autenticação é **inteiramente customizado e inseguro**: senhas armazenadas em texto puro nas tabelas `admins` e `alunos`, sem integração com Supabase Auth. O fluxo de "esqueci senha" apenas atualiza o banco diretamente sem enviar emails. A página `/confirmar-email` chama uma rota de API que não existe. **Nenhum email é enviado de fato.**

## Solução

Migrar a autenticação para o **Supabase Auth nativo** (`supabase.auth.*`), que oferece envio automático de emails (reset de senha, confirmação de cadastro), hashing seguro de senhas, sessões JWT e tokens seguros.

## Etapas

### 1. Reescrever `auth.service.ts` com Supabase Auth
- Login admin/aluno via `supabase.auth.signInWithPassword()`
- Cadastro aluno via `supabase.auth.signUp()` com metadata (nome, telefone, cpf)
- Esqueci senha via `supabase.auth.resetPasswordForEmail()` com `redirectTo` para `/update-password`
- Logout via `supabase.auth.signOut()`

### 2. Reescrever `authStore.ts` com sessão Supabase
- Usar `supabase.auth.onAuthStateChange()` para gerenciar sessão
- Buscar role do usuário na tabela `profiles` (já existente com coluna `role`)
- Remover gerenciamento manual de localStorage tokens

### 3. Criar novas páginas
- **`/auth/callback`** — Captura redirecionamentos do Supabase Auth (confirmação de email, password recovery). Detecta `type=recovery` para redirecionar ao formulário de nova senha, senão redireciona conforme role do usuário.
- **`/update-password`** — Formulário para definir nova senha com validação, usando `supabase.auth.updateUser({ password })`

### 4. Atualizar páginas existentes
- **`LoginPage.tsx`** — Substituir login customizado e forgot password por chamadas Supabase Auth nativas
- **`StudentLoginPage.tsx`** — Substituir login, cadastro e forgot password por Supabase Auth
- **Remover `ConfirmEmailPage.tsx`** (substituída por `/auth/callback`)

### 5. Atualizar rotas em `App.tsx`
- Adicionar `/auth/callback` e `/update-password`
- Remover `/confirmar-email`
- Manter redirects legados

### 6. Atualizar `api.ts`
- Atualizar rotas de autenticação para delegar aos novos métodos Supabase Auth

## Detalhes Técnicos

- O trigger `handle_new_user()` no banco já cria perfis automaticamente e vincula às tabelas `alunos`/`admins` no signup -- nenhuma migração de banco necessária
- Emails de reset de senha e confirmação de cadastro são enviados automaticamente pelo Supabase Auth
- Contas admin existentes na tabela `admins` precisarão ser recriadas no Supabase Auth (migração única, documentada para o usuário)
- A tabela `profiles` já possui coluna `role` que será usada para determinar o tipo de acesso (admin/student)

