
-- EXTENSÃO UUID
create extension if not exists "uuid-ossp";

-- TABELA ALUNOS
create table public.alunos (
  id uuid primary key,
  nome text,
  avatar_url text,
  status text default 'ativo',
  created_at timestamp default now()
);

-- TABELA ADMINS
create table public.admins (
  id uuid primary key,
  email text,
  role text default 'admin',
  created_at timestamp default now()
);

-- TABELA PROVAS
create table public.provas (
  id uuid primary key default uuid_generate_v4(),
  titulo text,
  descricao text,
  created_at timestamp default now()
);

-- TABELA PERGUNTAS
create table public.perguntas (
  id uuid primary key default uuid_generate_v4(),
  prova_id uuid references public.provas(id) on delete cascade,
  pergunta text
);

-- TABELA RESPOSTAS
create table public.respostas (
  id uuid primary key default uuid_generate_v4(),
  pergunta_id uuid references public.perguntas(id) on delete cascade,
  texto text,
  correta boolean default false
);

-- TABELA RESULTADOS
create table public.resultados (
  id uuid primary key default uuid_generate_v4(),
  aluno_id uuid references public.alunos(id) on delete cascade,
  prova_id uuid references public.provas(id) on delete cascade,
  pontuacao integer,
  created_at timestamp default now()
);

-- ATIVAR RLS
alter table public.alunos enable row level security;
alter table public.admins enable row level security;
alter table public.provas enable row level security;
alter table public.perguntas enable row level security;
alter table public.respostas enable row level security;
alter table public.resultados enable row level security;

-- POLÍTICAS ALUNOS
create policy "aluno_select_own"
on public.alunos for select
using (auth.uid() = id);

create policy "aluno_insert_own"
on public.alunos for insert
with check (auth.uid() = id);

create policy "aluno_update_own"
on public.alunos for update
using (auth.uid() = id);

-- POLÍTICAS ADMINS
create policy "admin_full_access"
on public.admins for all
using (auth.uid() = id);

-- POLÍTICAS PROVAS
create policy "admin_manage_provas"
on public.provas for all
using (exists (
  select 1 from public.admins where id = auth.uid()
));

-- POLÍTICAS PERGUNTAS
create policy "admin_manage_perguntas"
on public.perguntas for all
using (exists (
  select 1 from public.admins where id = auth.uid()
));

-- POLÍTICAS RESPOSTAS
create policy "admin_manage_respostas"
on public.respostas for all
using (exists (
  select 1 from public.admins where id = auth.uid()
));

-- POLÍTICAS RESULTADOS
create policy "aluno_see_own_result"
on public.resultados for select
using (auth.uid() = aluno_id);

create policy "aluno_insert_result"
on public.resultados for insert
with check (auth.uid() = aluno_id);
