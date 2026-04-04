

# Plano: Adicionar Fluxo de Reset de Senha por Email

## Analise do Estado Atual

O login funciona com autenticacao customizada (senhas em texto puro nas tabelas `admins` e `alunos`, sessao via localStorage). O sistema **NAO usa Supabase Auth** (`supabase.auth.*`) -- os usuarios nao existem em `auth.users`.

**Problemas encontrados:**
- Admin "Esqueci senha": chama API que apenas verifica se email existe no banco -- nenhum email e enviado
- Student "Esqueci senha": literalmente nao faz nada (`setForgotSent(true)` sem chamar API)
- Pagina `/confirmar-email` chama API inexistente

**Restricao critica:** Como os usuarios nao estao no `auth.users`, nao e possivel usar `supabase.auth.resetPasswordForEmail()` sem migrar todo o login. A solucao usa Edge Function + tokens proprios.

## O que NAO sera alterado
- Login existente (admin e aluno)
- `authStore` / logica de sessao
- Rotas ja existentes
- Design global

## Etapas

### 1. Criar tabela `password_reset_tokens` (migracao SQL)
Armazena tokens temporarios com expiracao de 1 hora, tipo de usuario (admin/student), e flag `used`.

### 2. Configurar email transacional
Usar o sistema de email transacional do Lovable para enviar os emails de reset com link seguro.

### 3. Criar Edge Function `send-reset-email`
Recebe email + tipo de usuario, verifica se existe no banco, gera token UUID, salva na tabela, envia email com link `{origin}/redefinir-senha?token={token}&email={email}`.

### 4. Atualizar `auth.service.ts`
- `forgotAdminPassword` e novo `forgotStudentPassword`: chamam a Edge Function
- `resetAdminPassword` e novo `resetStudentPassword`: validam token antes de atualizar senha

### 5. Corrigir `LoginPage.tsx` (admin)
- `handleForgotSubmit`: agora chama o servico que realmente envia email
- `handleResetSubmit`: valida token da URL antes de resetar
- Manter toda a UI existente

### 6. Corrigir `StudentLoginPage.tsx`
- `handleForgotPassword`: chamar API real que envia email
- Adicionar view de reset com campos nova senha + confirmacao
- Manter toda a UI de login/cadastro intacta

### 7. Atualizar `api.ts`
- Adicionar rotas para student forgot/reset password

### 8. Limpar `ConfirmEmailPage.tsx` quebrada
- Remover pagina e rota do `App.tsx`

## Detalhes Tecnicos
- Tokens UUID gerados com `gen_random_uuid()` no Postgres
- Expiracao de 1 hora, single-use (marcado `used = true` apos consumo)
- Email enviado via transactional email (Edge Function)
- Link de reset inclui token e email como query params
- RLS na tabela de tokens para seguranca

