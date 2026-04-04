

# Plano: Adicionar Fluxo de Reset de Senha por Email

## Analise do Estado Atual

O login funciona com autenticacao customizada (senhas em texto puro nas tabelas `admins` e `alunos`, sessao via localStorage). O sistema **NAO usa Supabase Auth** -- os usuarios nao existem em `auth.users`.

**Problemas:**
- Admin "Esqueci senha": chama API que apenas verifica se email existe -- nenhum email enviado
- Student "Esqueci senha": nao faz nada (apenas `setForgotSent(true)`)
- `/confirmar-email` chama API inexistente

**Restricao:** Sem `auth.users`, nao da pra usar `supabase.auth.resetPasswordForEmail()`. Solucao usa Edge Function + tokens proprios.

## O que NAO sera alterado
- Login existente (admin e aluno)
- `authStore` / logica de sessao
- Rotas ja existentes
- Design global

## Etapas

### 1. Criar tabela `password_reset_tokens` (migracao)
Tokens UUID, expiracao 1h, tipo usuario (admin/student), flag `used`.

### 2. Configurar email transacional
Scaffold transactional email via Lovable para enviar os emails de reset.

### 3. Criar Edge Function `send-reset-email`
Recebe email + tipo, verifica existencia no banco, gera token, salva, envia email com link `{origin}/redefinir-senha?token={token}&email={email}`.

### 4. Atualizar `auth.service.ts`
- `forgotAdminPassword` e `forgotStudentPassword`: chamam Edge Function
- `resetAdminPassword` e `resetStudentPassword`: validam token antes de atualizar senha

### 5. Corrigir `LoginPage.tsx` (admin)
- `handleForgotSubmit`: chama servico que envia email real
- `handleResetSubmit`: valida token da URL

### 6. Corrigir `StudentLoginPage.tsx`
- `handleForgotPassword`: chama API real
- Adicionar view de reset (nova senha + confirmacao)

### 7. Atualizar `api.ts` com novas rotas

### 8. Remover `ConfirmEmailPage.tsx` quebrada

## Detalhes Tecnicos
- Tokens UUID via `gen_random_uuid()`, single-use, expiracao 1h
- Email via transactional email (Lovable)
- RLS na tabela de tokens

