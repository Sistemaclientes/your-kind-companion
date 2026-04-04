

# Plano: Corrigir Sistema de Autenticação e Emails

## Problemas Atuais

O sistema de autenticação é **inteiramente customizado e inseguro**: senhas armazenadas em texto puro nas tabelas `admins` e `alunos`, sem integração com Supabase Auth. O fluxo de "esqueci senha" apenas atualiza o banco diretamente sem enviar emails. A página `/confirmar-email` chama uma rota de API que não existe. **Nenhum email é enviado de fato.**

## Solução

Migrar a autenticação para o **Supabase Auth nativo** (`supabase.auth.*`), que oferece envio automático de emails (reset de senha, confirmação de cadastro), hashing seguro de senhas, sessões JWT e tokens seguros.

## Etapas

### 1. Reescrever `auth.service.ts` com Supabase Auth
- Login admin/aluno: `supabase.auth.signInWithPassword()`
- Cadastro aluno: `supabase.auth.signUp()` com metadata (nome, telefone, cpf)
- Esqueci senha: `supabase.auth.resetPasswordForEmail()` com `redirectTo` correto
- Logout: `supabase.auth.signOut()`

### 2. Reescrever `authStore.ts` com sessão Supabase
- Usar `supabase.auth.onAuthStateChange()` ao invés de localStorage manual
- Buscar role do usuário na tabela `profiles` (já existente)
- Remover gerenciamento manual de tokens

### 3. Criar novas páginas
- **`/auth/callback`** — Captura redirecionamentos do Supabase (confirmação de email, recovery). Detecta `type=recovery` para redirecionar ao formulário de nova senha
- **`/update-password`** — Formulário para definir nova senha com `supabase.auth.updateUser({ password })`

### 4. Atualizar páginas existentes
- **`LoginPage.tsx`** — Substituir login e forgot password por chamadas Supabase Auth
- **`StudentLoginPage.tsx`** — Substituir login, cadastro e forgot password por Supabase Auth
- **Remover `ConfirmEmailPage.tsx`** (substituída por `/auth/callback`)

### 5. Atualizar rotas em `App.tsx`
- Adicionar `/auth/callback` e `/update-password`
- Remover `/confirmar-email`

### 6. Atualizar `api.ts`
- Atualizar rotas de autenticação para usar os novos métodos

## Observação
- O trigger `handle_new_user()` já cria perfis e vincula às tabelas `alunos`/`admins` — sem necessidade de migração de banco
- Emails de reset e confirmação são enviados automaticamente pelo Supabase
- Contas admin existentes precisarão ser recriadas no Supabase Auth (migração única)

