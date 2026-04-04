

# Plano: Adicionar Fluxo de Reset de Senha por Email

## Analise do Estado Atual

O login funciona com autenticacao customizada (senhas em texto puro nas tabelas `admins` e `alunos`, sessao via localStorage). O sistema **NAO usa Supabase Auth** -- os usuarios nao existem em `auth.users`.

**Problemas encontrados:**
- **Admin "Esqueci senha"** (`LoginPage.tsx`): chama `api.post('/admin/forgot-password')` que apenas verifica se email existe no banco -- nenhum email e enviado, mas mostra "Email enviado!"
- **Student "Esqueci senha"** (`StudentLoginPage.tsx`): `handleForgotPassword` apenas faz `setForgotSent(true)` -- nao chama nenhuma API
- **Pagina `/confirmar-email`**: chama `api.get('/confirmar-email?token=...')` que nao existe

**Restricao critica:** Como os usuarios nao estao no `auth.users`, NAO e possivel usar `supabase.auth.resetPasswordForEmail()`. A solucao usa Edge Function + tokens proprios.

## O que NAO sera alterado
- Login existente (admin e aluno)
- `authStore` / logica de sessao
- Rotas ja existentes
- Design global

## Etapas

### 1. Criar tabela `password_reset_tokens` (migracao SQL)
Tokens UUID, expiracao 1 hora, tipo usuario (admin/student), flag `used`. Com RLS.

### 2. Configurar email transacional
Verificar dominio de email. Se nao houver, configurar via dialog de setup. Depois configurar transactional email para enviar os emails de reset.

### 3. Criar Edge Function `send-reset-email`
Recebe email + user_type + origin, verifica existencia no banco, gera token, salva, envia email com link `{origin}/redefinir-senha?token={token}&email={email}`.

### 4. Atualizar `auth.service.ts`
- `forgotAdminPassword` e novo `forgotStudentPassword`: chamam Edge Function
- `resetAdminPassword` e novo `resetStudentPassword`: validam token antes de atualizar senha

### 5. Corrigir `LoginPage.tsx` e `StudentLoginPage.tsx`
- Forgot password chama API real que envia email
- Reset valida token da URL
- Student ganha view de reset (nova senha + confirmacao)

### 6. Atualizar `api.ts` com novas rotas

### 7. Remover `ConfirmEmailPage.tsx` quebrada

## Detalhes Tecnicos
- Tokens UUID via `gen_random_uuid()`, single-use, expiracao 1h
- Email via transactional email integrado
- RLS na tabela de tokens

