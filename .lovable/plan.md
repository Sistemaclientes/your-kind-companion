

# Plano de Seguranca - Hardening Completo

## Situacao Atual

**Ja feito:** extensao pgcrypto no schema extensions, coluna password_hash em alunos, funcoes hash_password() e login_user() com SECURITY DEFINER, RLS ativado em alunos e admins.

**Ainda vulneravel:**
- 0 de 8 alunos tem password_hash preenchido - senhas em texto puro
- Admin com senha visivel no banco
- Codigo compara senhas sem hash
- Funcao login_aluno compara texto puro
- Politicas RLS permissivas (USING true)
- Storage sem restricoes
- Lembrar-me salva senha no localStorage

## Etapa 1 - Migracao SQL

1. Adicionar password_hash a tabela admins
2. Migrar senhas existentes para bcrypt
3. Atualizar login_aluno para bcrypt
4. Criar login_admin como RPC segura
5. Criar register_aluno e change_admin_password
6. Remover politicas inseguras/duplicadas
7. Criar politicas de storage

## Etapa 2 - Atualizar codigo

- auth.service.ts: usar RPCs em vez de SELECT direto
- admin.service.ts: hash da senha ao criar admin

## Etapa 3 - Remover lembrar senha inseguro

- LoginPage.tsx e StudentLoginPage.tsx: salvar apenas email

## Etapa 4 - Limpeza

- Garantir que nenhuma query expoe senha ou password_hash
- is_correta exposto ao front durante prova (risco de cola)

## Alertas

- Coluna senha mantida temporariamente ate confirmar bcrypt
- WITH CHECK (true) em resultados/respostas_aluno necessario (auth customizada)

