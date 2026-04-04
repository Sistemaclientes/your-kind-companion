

# Plano: Adicionar Fluxo de Reset de Senha por Email

## Analise do Estado Atual

O login funciona com autenticacao customizada (senhas em texto puro nas tabelas `admins` e `alunos`, sessao via localStorage). O sistema **NAO usa Supabase Auth** -- os usuarios nao existem em `auth.users`.

**Problemas encontrados:**
- Admin "Esqueci senha": chama API que apenas verifica se email existe no banco -- nenhum email e enviado, mas mostra "Email enviado!"
- Student "Esqueci senha": literalmente nao faz nada (`setForgotSent(true)` sem chamar API nenhuma)
- Pagina `/confirmar-email` chama API inexistente

**Restricao critica:** Como os usuarios nao estao no `auth.users`, NAO e possivel usar `supabase.auth.resetPasswordForEmail()` sem migrar todo o sistema de login. A solucao usa Edge Function + tokens proprios para enviar emails reais.

## O que NAO sera alterado
- Login existente (admin e aluno)
- `authStore` / logica de sessao / localStorage
- Rotas ja existentes
- Design global

## Etapas de Implementacao

### 1. Criar tabela `password_reset_tokens` (migracao SQL)
Armazena tokens temporarios: `id`, `email`, `token` (UUID), `user_type` (admin/student), `expires_at` (1 hora), `used` (boolean). Com RLS e indices.

### 2. Configurar email transacional
Usar o sistema de email transacional do Lovable (scaffold + Edge Function `send-transactional-email`) para enviar os emails de reset com link seguro e template profissional.

### 3. Criar Edge Function `send-reset-email`
Recebe `email` e `user_type`, verifica se o usuario existe na tabela correspondente (`admins` ou `alunos`), gera token UUID, salva na tabela `password_reset_tokens`, e envia email transacional com link: `{origin}/redefinir-senha?token={token}&email={email}`.

### 4. Atualizar `auth.service.ts`
- `forgotAdminPassword`: chamar Edge Function `send-reset-email` com `user_type: 'admin'`
- `forgotStudentPassword` (novo): chamar Edge Function com `user_type: 'student'`
- `resetAdminPassword`: validar token na tabela antes de atualizar senha
- `resetStudentPassword` (novo): validar token e atualizar senha do aluno

### 5. Corrigir `LoginPage.tsx` (admin)
- `handleForgotSubmit`: chamar o novo servico que envia email de verdade
- `handleResetSubmit`: usar token da URL para validar antes de resetar
- Manter toda a UI e animacoes existentes

### 6. Corrigir `StudentLoginPage.tsx`
- `handleForgotPassword`: chamar API real que envia email
- Adicionar view de reset de senha (campos nova senha + confirmacao + validacao)
- Manter toda a UI de login/cadastro intacta

### 7. Atualizar `api.ts`
- Adicionar rotas para `student/forgot-password` e `student/reset-password`

### 8. Remover `ConfirmEmailPage.tsx` quebrada
- Remover pagina e rota `/confirmar-email` do `App.tsx`

## Detalhes Tecnicos
- Tokens UUID gerados com `gen_random_uuid()` no Postgres
- Expiracao de 1 hora, single-use (marcado `used = true` apos consumo)
- Email enviado via sistema transacional do Lovable (sem necessidade de API key externa)
- Link de reset inclui token e email como query params
- RLS policies na tabela de tokens

