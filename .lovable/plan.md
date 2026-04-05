

# Plano de Seguranca - Hardening Completo

## Situacao Atual

Apos analise detalhada do banco e codigo, identifiquei o que ja foi feito e o que ainda precisa ser corrigido.

**Ja feito em migracoes anteriores:**
- Extensao pgcrypto movida para schema extensions
- Coluna password_hash adicionada a tabela alunos
- Funcoes hash_password() e login_user() criadas com SECURITY DEFINER
- RLS ativado em alunos e admins

**Ainda vulneravel:**
- 0 de 8 alunos tem password_hash preenchido -- senhas em texto puro na coluna senha
- Admin com senha visivel no banco
- Codigo front-end (auth.service.ts) compara senhas com toLowerCase() sem hash
- Funcao login_aluno compara senha em texto puro
- Politicas RLS duplicadas e permissivas (USING true, WITH CHECK true)
- Politica de admins permite acesso quando auth.uid() IS NULL
- Storage sem politicas restritivas
- "Lembrar-me" salva senha em texto puro no localStorage

---

## Execucao em 4 Etapas

### Etapa 1 -- Migracao SQL (via ferramenta de migracao)

Uma unica migracao SQL que fara:

1. Adicionar password_hash a tabela admins
2. Migrar senhas existentes de alunos e admins para bcrypt usando extensions.crypt()
3. Atualizar funcao login_aluno para validar via bcrypt (em vez de comparacao texto puro)
4. Criar funcao login_admin como RPC segura com bcrypt
5. Criar funcao register_aluno que ja faz hash da senha ao registrar
6. Criar funcao change_admin_password que valida senha atual e faz hash da nova
7. Remover politicas RLS inseguras/duplicadas:
   - "Permitir consulta publica de existencia de email" (USING true -- expoe todos os emails)
   - "Auto-registro publico de alunos" (WITH CHECK true -- sem restricao)
   - "admin only access" (duplicada/generica)
   - "select own user", "update own user", "delete own user" (duplicadas das politicas em portugues)
   - Corrigir "Visualizacao de admins" removendo condicao auth.uid() IS NULL
8. Criar politicas de storage para avatars e banners (leitura publica, escrita autenticada)

### Etapa 2 -- Atualizar codigo de autenticacao

**src/services/auth.service.ts:**
- loginAdmin(): trocar SELECT direto + comparacao texto puro por chamada RPC login_admin
- registerStudent(): usar RPC register_aluno em vez de insert direto com senha em texto puro
- changeAdminPassword(): usar RPC change_admin_password

**src/services/admin.service.ts:**
- Criar admin com senha hashada via RPC em vez de insert com senha em texto puro

### Etapa 3 -- Remover "lembrar senha" inseguro

**src/pages/LoginPage.tsx:** parar de salvar admin_remembered_pw no localStorage, manter apenas email

**src/pages/StudentLoginPage.tsx:** idem -- salvar apenas email, nunca senha

### Etapa 4 -- Limpeza

- Verificar que nenhuma query do front-end pede as colunas senha ou password_hash
- Nota: is_correta e retornado nas alternativas durante a prova -- alunos podem ver respostas corretas no DevTools (risco de cola -- sera tratado separadamente)

---

## Alertas Importantes

- A coluna senha sera mantida temporariamente ate confirmar que o login com bcrypt funciona corretamente
- As politicas WITH CHECK (true) em resultados e respostas_aluno precisam permanecer porque o sistema usa autenticacao customizada (sem auth.users) -- alunos nao tem auth.uid()
- O campo is_correta nas alternativas e enviado ao front durante a prova

