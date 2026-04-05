
-- Mover pgcrypto para extensions schema
alter extension pgcrypto set schema extensions;

-- Corrigir search_path da função hash_password
create or replace function public.hash_password(password text)
returns text
language sql
stable
security definer
set search_path = public, extensions
as $$
  select extensions.crypt(password, extensions.gen_salt('bf'));
$$;

-- Atualizar login_user para usar extensions.crypt
create or replace function public.login_user(email_input text, password_input text)
returns table(id uuid, email text)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select a.id, a.email
  from alunos a
  where a.email = email_input
    and a.password_hash = extensions.crypt(password_input, a.password_hash);
end;
$$;
