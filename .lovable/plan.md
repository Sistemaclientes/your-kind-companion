

# Plano: Adicionar Fluxo de Reset de Senha por Email

## Analise do Estado Atual

O login funciona com autenticacao customizada (senhas em texto puro nas tabelas `admins` e `alunos`, sessao via localStorage). O sistema **NAO usa Supabase Auth** -- os usuarios nao existem em `auth.users`.

**Problemas encontrados:**
- **Admin "Esqueci senha"**: chama API que apenas verifica se email existe no banco -- nenhum email e enviado, mas mostra "Email enviado!"
- **Student "Esqueci senha"**: literalmente nao faz nada (`setForgotSent(true)` sem chamar API nenhuma)
- **Pagina `/confirmar-email`**: chama API inexistente e esta completamente quebrada

**Restricao critica:** Como os usuarios nao estao no `auth.users`, NAO e possivel usar `supabase.auth.resetPasswordForEmail()` sem migrar todo o login. A solucao usa Edge Function + tokens proprios para enviar emails reais.

## O que NAO sera alterado
- Login existente (admin e aluno)
- `authStore` / logica de sessao
- Rotas ja existentes
- Design global

## Etapas de Implementacao

### 1. Criar tabela `password_reset_tokens` (migracao SQL)
Tabela com: `id` (UUID), `email`, `token` (UUID unico), `user_type` (admin/student), `expires_at` (1 hora), `used` (boolean), `created_at`. RLS habilitado e indices para performance.

### 2. Configurar email transacional
Verificar se ha dominio de email configurado no projeto. Se nao houver, sera necessario configurar primeiro via dialog de setup de dominio. Depois, configurar o envio de emails transacionais para os emails de reset com template profissional.

### 3. Criar Edge Function `send-reset-email`
Recebe `email` + `user_type`, verifica se o usuario existe na tabela correspondente (`admins` ou `alunos`), gera token UUID, salva na tabela `password_reset_tokens`, e envia email transacional com link: `{origin}/redefinir-senha?token={token}&email={email}`.

### 4. Atualizar `auth.service.ts`
- `forgotAdminPassword`: chamar Edge Function com `user_type: 'admin'`
- Novo `forgotStudentPassword`: chamar Edge Function com `user_type: 'student'`
- `resetAdminPassword`: validar token na tabela antes de atualizar senha
- Novo `resetStudentPassword`: validar token e atualizar senha do aluno

### 5. Corrigir `LoginPage.tsx` (admin)
- `handleForgotSubmit`: chamar o novo servico que envia email real
- `handleResetSubmit`: usar token da URL para validar antes de resetar
- Manter toda a UI e animacoes existentes

### 6. Corrigir `StudentLoginPage.tsx`
- `handleForgotPassword`: chamar API real que envia email
- Adicionar view de reset de senha (campos nova senha + confirmacao + validacao)
- Manter toda a UI de login/cadastro intacta

### 7. Atualizar `api.ts` com novas rotas
- `student/forgot-password` e `student/reset-password`

### 8. Remover `ConfirmEmailPage.tsx` quebrada
- Remover pagina e rota `/confirmar-email` do `App.tsx`

## Detalhes Tecnicos
- Tokens UUID gerados com `gen_random_uuid()`, single-use (marcado `used = true` apos consumo), expiracao 1 hora
- Email enviado via sistema de email transacional integrado ao projeto
- RLS na tabela de tokens para seguranca
- Nenhuma alteracao no fluxo de login existente

