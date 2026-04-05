

# Plano de Segurança — Hardening Completo do Sistema

## Situação Atual

Após análise detalhada do banco e código, identifiquei:

**Já feito (migrações anteriores):**
- Extensão `pgcrypto` movida para schema `extensions`
- Coluna `password_hash` adicionada à tabela `alunos`
- Funções `hash_password()` e `login_user()` criadas com `SECURITY DEFINER`
- RLS ativado em `alunos` e `admins`

**Ainda vulnerável:**
- 0 de 8 alunos tem `password_hash` preenchido — senhas em texto puro na coluna `senha`
- Admin tem senha visível no banco (`Baudasorte123@`)
- Código front-end compara senhas com `toLowerCase()` (sem hash)
- Função `login_aluno` ainda compara `senha` em texto puro
- Políticas RLS duplicadas e permissivas (`USING (true)`, `WITH CHECK (true)`)
- Política de admins permite acesso quando `auth.uid() IS NULL`
- Storage sem políticas restritivas
- "Lembrar-me" salva senha em texto puro no localStorage

---

## Plano de Execução (4 etapas)

### Etapa 1 — Migração SQL (via ferramenta de migração)

1. Adicionar `password_hash` à tabela `admins`
2. Migrar todas as senhas existentes de `alunos` e `admins` para bcrypt
3. Atualizar função `login_aluno` para validar via bcrypt
4. Criar função `login_admin` como RPC segura com bcrypt
5. Remover políticas RLS inseguras e duplicadas
6. Criar políticas de storage para `avatars` e `banners`

### Etapa 2 — Atualizar código de autenticação

**Arquivo: `src/services/auth.service.ts`**
- `loginAdmin()`: trocar SELECT direto por chamada RPC `login_admin`
- `changeAdminPassword()`: usar hash bcrypt
- `registerStudent()`: incluir `password_hash` via função `hash_password()`

**Arquivo: `src/services/admin.service.ts`**
- Hash da senha padrão ao criar admin

### Etapa 3 — Remover "lembrar senha" inseguro

**Arquivos: `LoginPage.tsx` e `StudentLoginPage.tsx`**
- Parar de salvar senha no localStorage
- Manter apenas o email no "lembrar-me"

### Etapa 4 — Limpeza final

- Verificar que nenhuma query expõe `senha` ou `password_hash`
- Confirmar que `is_correta` não é exposto aos alunos durante a prova (via DevTools)

---

## Detalhes Técnicos

**Políticas RLS a remover:**
- `Permitir consulta pública de existência de email` (USING true — expõe todos os emails)
- `Auto-registro público de alunos` (WITH CHECK true — sem restrição)
- `admin only access` (duplicada/genérica)
- `select own user`, `update own user`, `delete own user` (duplicadas)
- `Visualização de admins` — remover condição `auth.uid() IS NULL`

**Alertas:**
- A coluna `senha` será mantida temporariamente até confirmar que bcrypt funciona
- As políticas `WITH CHECK (true)` em `resultados` e `respostas_aluno` precisam permanecer porque o sistema usa autenticação customizada (sem `auth.users`)
- O campo `is_correta` nas alternativas é retornado ao front durante a prova — alunos podem ver respostas corretas no DevTools

