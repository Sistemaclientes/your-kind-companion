

# Plano: Adicionar Fluxo de Reset de Senha por Email

## Analise do Estado Atual

O login funciona com autenticacao customizada (senhas em texto puro nas tabelas `admins` e `alunos`, sessao via localStorage). O sistema **NAO usa Supabase Auth** -- os usuarios nao existem em `auth.users`.

**Problemas encontrados:**
- **Admin "Esqueci senha"** (`LoginPage.tsx`): chama `api.post('/admin/forgot-password')` que apenas verifica se email existe no banco -- nenhum email e enviado, mas a UI mostra "Email enviado!"
- **Student "Esqueci senha"** (`StudentLoginPage.tsx`): `handleForgotPassword` apenas faz `setForgotSent(true)` -- literalmente nao chama nenhuma API
- **Pagina `/confirmar-email`**: chama API inexistente (removida com o backend Node)

**Restricao critica:** Como os usuarios nao existem em `auth.users`, NAO e possivel usar `supabase.auth.resetPasswordForEmail()`. A solucao usa Edge Function + tokens proprios.

## O que NAO sera alterado
- Login existente (admin e aluno)
- `authStore` / logica de sessao / localStorage
- Rotas ja existentes
- Design global

## Etapas de Implementacao

### 1. Criar tabela `password_reset_tokens` (migracao SQL)
Tabela com `id`, `email`, `token` (UUID), `user_type` (admin/student), `expires_at` (1 hora), `used` (boolean), `created_at`. RLS habilitado.

### 2. Configurar email transacional
Verificar dominio de email configurado. Se nao houver, configurar via dialog de setup. Depois configurar envio de emails transacionais para reset de senha.

### 3. Criar Edge Function `send-reset-email`
Recebe email + user_type + origin. Verifica existencia do usuario no banco, gera token UUID, salva na tabela, envia email com link contendo token e email como query params.

### 4. Atualizar `auth.service.ts`
- `forgotAdminPassword` e novo `forgotStudentPassword`: chamam a Edge Function
- `resetAdminPassword` e novo `resetStudentPassword`: validam token antes de atualizar senha

### 5. Corrigir `LoginPage.tsx` (admin)
- `handleForgotSubmit`: chama servico que envia email real
- `handleResetSubmit`: valida token da URL

### 6. Corrigir `StudentLoginPage.tsx`
- `handleForgotPassword`: chama API real que envia email
- Adicionar view de reset (nova senha + confirmacao + validacao)

### 7. Atualizar `api.ts` com novas rotas

### 8. Remover `ConfirmEmailPage.tsx` quebrada

## Detalhes Tecnicos
- Tokens UUID via `gen_random_uuid()`, single-use, expiracao 1h
- Email via sistema de email transacional integrado
- RLS na tabela de tokens

