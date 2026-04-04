

# Plano: Adicionar Fluxo de Reset de Senha por Email

## Analise do Estado Atual

O login funciona com autenticacao customizada (senhas em texto puro nas tabelas `admins` e `alunos`, sessao via localStorage). O sistema **NAO usa Supabase Auth** -- os usuarios nao existem em `auth.users`.

**Problemas encontrados:**
- Admin "Esqueci senha": chama API que apenas verifica se email existe no banco -- nenhum email e enviado, mas mostra "Email enviado!"
- Student "Esqueci senha": literalmente nao faz nada (`setForgotSent(true)` sem chamar API)
- Pagina `/confirmar-email` chama API inexistente

**Restricao critica:** Como os usuarios nao estao no `auth.users`, NAO e possivel usar `supabase.auth.resetPasswordForEmail()` sem migrar todo o login. A solucao usa Edge Function + tokens proprios para enviar emails reais.

## O que NAO sera alterado
- Login existente (admin e aluno)
- `authStore` / logica de sessao
- Rotas ja existentes
- Design global

## Etapas

### 1. Criar tabela `password_reset_tokens` (migracao SQL)
Tokens UUID, expiracao 1 hora, tipo usuario (admin/student), flag `used`. Com RLS e indices.

### 2. Configurar sistema de email transacional
Configurar envio de emails de reset via sistema de email transacional integrado ao projeto. Requer configuracao de dominio de email primeiro.

### 3. Criar Edge Function `send-reset-email`
Recebe email + user_type, verifica existencia no banco, gera token, salva na tabela, envia email com link contendo token e email como query params para a pagina de redefinicao.

### 4. Atualizar `auth.service.ts`
- `forgotAdminPassword` e novo `forgotStudentPassword`: chamam a Edge Function
- `resetAdminPassword` e novo `resetStudentPassword`: validam token antes de atualizar senha

### 5. Corrigir `LoginPage.tsx` (admin)
- `handleForgotSubmit`: chama servico que envia email real
- `handleResetSubmit`: valida token da URL

### 6. Corrigir `StudentLoginPage.tsx`
- `handleForgotPassword`: chama API real que envia email
- Adicionar view de reset (nova senha + confirmacao)

### 7. Atualizar `api.ts` com novas rotas

### 8. Remover `ConfirmEmailPage.tsx` quebrada

## Detalhes Tecnicos
- Tokens UUID via `gen_random_uuid()`, single-use, expiracao 1h
- Email enviado via sistema de email transacional integrado
- RLS na tabela de tokens para seguranca

