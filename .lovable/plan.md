

# Plano: Adicionar Fluxo de Reset de Senha (sem alterar login existente)

## Analise do Estado Atual

O login atual funciona com autenticacao customizada (senhas em texto puro nas tabelas `admins` e `alunos`). O `authStore` usa localStorage. O sistema NAO usa Supabase Auth (`supabase.auth.*`).

Problemas encontrados:
- **Admin forgot password**: chama API que apenas verifica se email existe -- nao envia email
- **Student forgot password**: literalmente nao faz nada (apenas muda state local)
- **Nao existe** `/auth/callback` nem `/update-password`
- A pagina `/confirmar-email` chama API inexistente

## Restricao

Como o sistema NAO usa Supabase Auth para login, nao e possivel usar `supabase.auth.resetPasswordForEmail()`. Os usuarios nao existem em `auth.users`.

## Abordagem (sem quebrar nada)

Usar Edge Function + tabela de tokens para enviar emails de reset reais.

### 1. Criar tabela `password_reset_tokens` (migracao)
- Colunas: `id`, `email`, `token`, `user_type` (admin/student), `expires_at`, `used`
- Token expira em 1 hora

### 2. Criar Edge Function `send-reset-email`
- Gera token, salva no banco, envia email com link de reset
- Usa transactional email do Lovable

### 3. Corrigir `auth.service.ts`
- Forgot password: chamar Edge Function que envia email real
- Reset password: validar token antes de atualizar senha
- Adicionar suporte para admin e student

### 4. Corrigir `LoginPage.tsx` e `StudentLoginPage.tsx`
- Forgot password agora chama API real
- Manter toda a UI e logica de login intacta

### 5. Atualizar `api.ts` com novas rotas

### 6. Limpar `ConfirmEmailPage.tsx` quebrada

## O que NAO sera alterado
- Login existente (admin e aluno)
- authStore / logica de sessao
- Rotas existentes
- Design global

