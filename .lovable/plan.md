

# Plano: Adicionar Fluxo de Reset de Senha por Email

## Analise do Estado Atual

O login funciona com autenticacao customizada (senhas em texto puro nas tabelas `admins` e `alunos`, sessao via localStorage). O sistema **NAO usa Supabase Auth** -- os usuarios nao existem em `auth.users`.

**Problemas encontrados:**
- **Admin "Esqueci senha"** (`LoginPage.tsx` linha 80): chama `api.post('/admin/forgot-password')` que apenas verifica se o email existe no banco e retorna. Nenhum email e enviado, mas a UI mostra "Email enviado!"
- **Student "Esqueci senha"** (`StudentLoginPage.tsx` linha 154-158): `handleForgotPassword` apenas faz `setForgotSent(true)` -- literalmente nao chama nenhuma API
- **Pagina `/confirmar-email`**: chama `api.get('/confirmar-email?token=...')` que nao existe (a API foi removida junto com o backend Node)

**Restricao critica:** Como os usuarios nao estao em `auth.users`, NAO e possivel usar `supabase.auth.resetPasswordForEmail()` sem migrar todo o sistema de login. A solucao usa Edge Function + tokens proprios para enviar emails reais.

## O que NAO sera alterado
- Login existente (admin e aluno)
- `authStore` / logica de sessao / localStorage
- Rotas ja existentes
- Design global

## Etapas de Implementacao

### 1. Criar tabela `password_reset_tokens` (migracao SQL)
Tabela com: `id` (UUID), `email`, `token` (UUID unico), `user_type` (admin/student), `expires_at` (now + 1 hora), `used` (boolean default false), `created_at`. RLS habilitado com politica de insert para service_role.

### 2. Configurar email transacional
Verificar se ha dominio de email configurado no projeto. Se nao houver, sera necessario configurar um dominio primeiro via o dialog de setup de email. Depois, configurar transactional email para enviar os emails de reset com template profissional.

### 3. Criar Edge Function `send-reset-email`
Recebe `email`, `user_type` (admin/student), e `origin` (URL base). Verifica se o usuario existe na tabela correspondente (`admins` ou `alunos`). Gera token UUID, salva na tabela `password_reset_tokens`, e envia email transacional com link: `{origin}/redefinir-senha?token={token}&email={email}&type={user_type}`.

### 4. Atualizar `auth.service.ts`
- `forgotAdminPassword`: chamar Edge Function `send-reset-email` com `user_type: 'admin'` (ao inves de apenas verificar se email existe)
- Novo `forgotStudentPassword`: chamar Edge Function com `user_type: 'student'`
- `resetAdminPassword`: validar token na tabela (verificar existencia, expiracao, e se nao foi usado) antes de atualizar senha na tabela `admins`
- Novo `resetStudentPassword`: validar token e atualizar senha na tabela `alunos`

### 5. Corrigir `LoginPage.tsx` (admin)
- `handleForgotSubmit`: chamar o novo servico que realmente envia email
- `handleResetSubmit`: usar token e email da URL para validar antes de resetar
- Manter toda a UI e animacoes existentes intactas

### 6. Corrigir `StudentLoginPage.tsx`
- `handleForgotPassword`: chamar API real que envia email (ao inves de apenas `setForgotSent(true)`)
- Adicionar view de reset de senha com campos nova senha + confirmacao + validacao
- Detectar token na URL para mostrar view de reset automaticamente
- Manter toda a UI de login/cadastro intacta

### 7. Atualizar `api.ts`
- Adicionar rotas `student/forgot-password` e `student/reset-password` delegando para os novos metodos

### 8. Remover `ConfirmEmailPage.tsx` quebrada
- Remover pagina e rota `/confirmar-email` do `App.tsx`

## Detalhes Tecnicos
- Tokens UUID gerados com `gen_random_uuid()` no Postgres, single-use (marcado `used = true` apos consumo), expiracao de 1 hora
- Email enviado via sistema de email transacional integrado ao projeto
- RLS na tabela de tokens -- apenas service_role pode inserir/ler
- Nenhuma alteracao no fluxo de login existente

