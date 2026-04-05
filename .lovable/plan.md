

## Situacao Atual

**Ja feito em migracoes anteriores:**
- Extensao pgcrypto movida para schema extensions
- Coluna password_hash adicionada a tabela alunos
- Funcoes hash_password() e login_user() criadas com SECURITY DEFINER
- RLS ativado em alunos e admins

**Ainda vulneravel:**
- 0 de 8 alunos tem password_hash preenchido - senhas em texto puro na coluna senha
- Admin com senha visivel no banco
- Codigo front-end compara senhas com toLowerCase() sem hash
- Funcao login_aluno compara senha em texto puro
- Politicas RLS duplicadas e permissivas (USING true, WITH CHECK true)
- Storage sem politicas restritivas
- "Lembrar-me" salva senha em texto puro no localStorage

---

## Execucao em 4 Etapas

### Etapa 1 - Migracao SQL

1. Adicionar password_hash a tabela admins
2. Migrar senhas existentes de alunos e admins para bcrypt
3. Atualizar funcao login_aluno para validar via bcrypt
4. Criar funcao login_admin como RPC segura com bcrypt
5. Criar funcao register_aluno que faz hash da senha
6. Criar funcao change_admin_password
7. Remover politicas RLS inseguras/duplicadas
8. Criar politicas de storage para avatars e banners

### Etapa 2 - Atualizar codigo de autenticacao

- **auth.service.ts:** trocar SELECT direto por RPCs (login_admin, register_aluno, change_admin_password)
- **admin.service.ts:** criar admin com senha hashada via RPC

### Etapa 3 - Remover "lembrar senha" inseguro

- **LoginPage.tsx e StudentLoginPage.tsx:** salvar apenas email, nunca senha no localStorage

### Etapa 4 - Limpeza

- Verificar que nenhuma query expoe senha ou password_hash

---

## Alertas

- Coluna senha mantida temporariamente ate confirmar bcrypt
- WITH CHECK (true) em resultados/respostas_aluno necessario (auth customizada sem auth.users)
- is_correta e enviado ao front durante a prova (risco de cola)

