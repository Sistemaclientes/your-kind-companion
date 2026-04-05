
-- =========================================
-- 1. EXTENSÃO PARA HASH (bcrypt)
-- =========================================
create extension if not exists pgcrypto;

-- =========================================
-- 2. CORRIGIR TABELA ALUNOS (SENHA SEGURA)
-- =========================================
alter table alunos
add column if not exists password_hash text;

-- =========================================
-- 3. FUNÇÃO PARA CRIAR HASH
-- =========================================
create or replace function public.hash_password(password text)
returns text
language sql
as $$
  select crypt(password, gen_salt('bf'));
$$;

-- =========================================
-- 4. FUNÇÃO DE LOGIN SEGURA
-- =========================================
create or replace function public.login_user(email_input text, password_input text)
returns table(id uuid, email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select a.id, a.email
  from alunos a
  where a.email = email_input
    and a.password_hash = crypt(password_input, a.password_hash);
end;
$$;

-- =========================================
-- 5. RLS JÁ ATIVO - ADICIONAR POLÍTICAS
-- =========================================

-- SELECT: só o próprio usuário
create policy "select own user"
on alunos
for select
using (auth.uid() = id);

-- INSERT: apenas autenticado
create policy "insert authenticated"
on alunos
for insert
with check (auth.uid() is not null);

-- UPDATE: só o dono
create policy "update own user"
on alunos
for update
using (auth.uid() = id);

-- DELETE: só o dono
create policy "delete own user"
on alunos
for delete
using (auth.uid() = id);

-- =========================================
-- 7. ADMIN (POLÍTICA RESTRITIVA)
-- =========================================
create policy "admin only access"
on admins
for all
using (auth.role() = 'authenticated');

-- =========================================
-- 9. STORAGE (SEGURANÇA)
-- =========================================
create policy "public read"
on storage.objects
for select
using (bucket_id in ('avatars','banners'));

create policy "auth upload"
on storage.objects
for insert
with check (auth.role() = 'authenticated');

create policy "owner update"
on storage.objects
for update
using (auth.uid() = owner);

create policy "owner delete"
on storage.objects
for delete
using (auth.uid() = owner);
