

# Plano: Adicionar Fluxo de Reset de Senha (sem alterar login existente)

## Analise do Estado Atual

O login atual funciona com autenticacao customizada (senhas em texto puro nas tabelas `admins` e `alunos`). O `authStore` usa localStorage. O sistema NAO usa Supabase Auth (`supabase.auth.*`).

Problemas encontrados:
- **Admin forgot password** (`LoginPage.tsx` linha 80): chama `api.post('/admin/forgot-password')` que apenas verifica se o email existe no banco -- nao envia nenhum email. Depois mostra "Email enviado!" mas nada foi enviado.
- **Admin reset password** (`LoginPage.tsx` linha 109): chama `api.post('/admin/reset-password')` que atualiza a senha diretamente no banco -- funciona mas sem email/token real.
- **Student forgot password** (`StudentLoginPage.tsx` linha 154): `handleForgotPassword` apenas faz `setForgotSent(true)` -- literalmente nao faz nada. Nenhuma API e chamada.
- **Nao existe** `/auth/callback` nem `/update-password`.
- A pagina `/confirmar-email` chama `api.get('/confirmar-email?token=...')` que nao existe.

## Restricao Critica

Como o sistema NAO usa Supabase Auth para login (usa senhas em texto puro), **nao e possivel usar `supabase.auth.resetPasswordForEmail()`** sem migrar o login inteiro para Supabase Auth. Os usuarios nao existem em `auth.users`.

## Abordagem Realista (sem quebrar nada)

Usar uma **Edge Function do Supabase** para enviar emails de reset de senha via o sistema de email ja existente, gerando tokens temporarios armazenados no banco.

### 1. Criar tabela `password_reset_tokens` (migracao)
- Colunas: `id`, `email`, `token` (uuid), `expires_at`, `used`, `created_at`
- Token expira em 1 hora

### 2. Criar Edge Function `send-reset-email`
- Recebe email, gera token, salva no banco
- Envia email com link `{origin}/redefinir-senha?token={token}&email={email}`
- Usa o Lovable email system (transactional email)

### 3. Corrigir `auth.service.ts`
- `forgotAdminPassword`: chamar a Edge Function ao inves de apenas verificar se email existe
- `resetAdminPassword`: validar token antes de atualizar senha
- Adicionar `forgotStudentPassword` e `resetStudentPassword` com a mesma logica

### 4. Corrigir `LoginPage.tsx` (admin forgot password)
- `handleForgotSubmit`: chamar o novo metodo que envia email de verdade
- `handleResetSubmit`: validar token antes de resetar

### 5. Corrigir `StudentLoginPage.tsx` (student forgot password)
- `handleForgotPassword`: chamar API real que envia email
- Adicionar tela de reset de senha para o aluno

### 6. Atualizar `api.ts`
- Adicionar rota para student forgot/reset password

### 7. Remover `ConfirmEmailPage.tsx` (quebrada)
- Remover rota `/confirmar-email` do `App.tsx`

## Resultado
- Emails de reset de senha enviados de verdade (admin e aluno)
- Tokens seguros com expiracao
- Sem alterar login, authStore, rotas existentes ou logica de sessao
- UX com loading states e feedback visual

