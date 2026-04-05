

# Plano de Segurança — Hardening Completo do Sistema

## Situação Atual

Após análise detalhada, identifiquei o seguinte estado:

**Já feito (migrações anteriores):**
- Extensão `pgcrypto` movida para schema `extensions`
- Coluna `password_hash` adicionada à tabela `alunos`
- Funções `hash_password()` e `login_user()` criadas com `SECURITY DEFINER`
- RLS ativado em `alunos` e `admins`
- Algumas políticas de segurança adicionadas

**Ainda vulnerável:**
- Nenhuma senha foi migrada para bcrypt (0 de 8 alunos tem `password_hash`, 5 têm `senha` em texto puro)
- Admin tem senha em texto puro (`Baudasorte123@` visível no banco)
- Código do front-end (`auth.service.ts`) compara senhas em texto puro com `toLowerCase()`
- Função `login_aluno` ainda compara `senha` em texto puro (não usa bcrypt)
- Políticas RLS duplicadas e permissivas (`USING (true)`, `WITH CHECK (true)`)
- Admins: política `Visualização de admins` permite acesso quando `auth.uid() IS NULL`
- Storage: sem políticas restritivas aplicadas
- Admin login salva senha no localStorage em texto puro ("remember me")

---

## Plano de Execução (4 etapas)

### Etapa 1 — Migração de senhas para bcrypt + limpeza de políticas RLS

**Migração SQL** que fará:

1. **Migrar senhas existentes** de `alunos` e `admins` para `password_hash` usando `extensions.crypt()`
2. **Adicionar `password_hash`** à tabela `admins`
3. **Atualizar `login_aluno`** para validar via bcrypt em vez de texto puro
4. **Criar `login_admin`** como função RPC segura com bcrypt
5. **Remover políticas RLS inseguras/duplicadas:**
   - `Permitir consulta pública de existência de email` (USING true)
   - `Auto-registro público de alunos` (WITH CHECK true) — substituir por versão que restringe colunas
   - `admin only access` (duplicada/genérica)
   - `select own user`, `update own user`, `delete own user` (duplicadas das políticas em português)
   - `Visualização de admins` — remover condição `auth.uid() IS NULL`
6. **Políticas de storage** para `avatars` e `banners`

### Etapa 2 — Atualizar código front-end (`auth.service.ts`)

- `loginAdmin()`: Substituir SELECT direto + comparação de texto puro por chamada RPC `login_admin`
- `loginStudent()`: Já usa `login_aluno` (RPC) — só precisa garantir que a função DB foi atualizada
- `changeAdminPassword()`: Usar bcrypt para comparação e hash da nova senha
- `registerStudent()`: Fazer hash da senha antes de inserir (usar RPC ou função DB)
- Remover `senha` dos inserts e comparar apenas `password_hash`

### Etapa 3 — Remover "remember me" inseguro

- `LoginPage.tsx`: Parar de salvar senha em texto puro no localStorage (`admin_remembered_pw`)
- `StudentLoginPage.tsx`: Idem para `student_remembered`
- Salvar apenas o email no "lembrar-me"

### Etapa 4 — Limpeza final

- Verificar que nenhuma query direta expõe `senha` ou `password_hash`
- Remover colunas `senha` de ambas as tabelas (após confirmar que bcrypt funciona)
- Garantir que `is_correta` não é exposto na listagem de alternativas para alunos durante prova

---

## Detalhes Técnicos

**Migração SQL principal:**
```text
1. ALTER TABLE admins ADD COLUMN password_hash text
2. UPDATE alunos SET password_hash = extensions.crypt(senha, extensions.gen_salt('bf')) WHERE senha IS NOT NULL
3. UPDATE admins SET password_hash = extensions.crypt(senha, extensions.gen_salt('bf'))
4. CREATE/REPLACE login_aluno → usar extensions.crypt() para validar
5. CREATE login_admin → mesma lógica
6. DROP duplicated/insecure policies
7. CREATE storage policies
```

**Arquivos a modificar:**
- `src/services/auth.service.ts` — usar RPCs para login, hash para registro
- `src/services/admin.service.ts` — hash senha no create
- `src/pages/LoginPage.tsx` — remover salvamento de senha no localStorage
- `src/pages/StudentLoginPage.tsx` — idem
- `src/services/exams.service.ts` — registro de aluno no submit (linha 190-196) não deve incluir senha

**Alertas de segurança:**
- A coluna `senha` só será removida APÓS confirmar que o login com bcrypt funciona
- As políticas `WITH CHECK (true)` em `resultados` e `respostas_aluno` precisam permanecer temporariamente porque o sistema usa autenticação customizada (sem `auth.users`), mas devem ser substituídas por validação via RPC futuramente
- O campo `is_correta` nas alternativas é retornado ao front-end durante a prova — isso permite que alunos vejam as respostas corretas no DevTools

