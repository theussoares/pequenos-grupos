-- Row Level Security (§2.4 do PDF)
-- admin vê e edita tudo · líder vê apenas visitantes do seu PG ·
-- padrinho vê apenas afilhados · recepcionista apenas insere.

alter table profiles enable row level security;
alter table pgs enable row level security;
alter table visitantes enable row level security;
alter table interacoes enable row level security;
alter table presencas_pg enable row level security;

-- Helper: papel do usuário autenticado
create or replace function current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function current_pg_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select pg_id from profiles where id = auth.uid();
$$;

-- profiles: cada um lê o próprio; admin lê todos
create policy profiles_self_select on profiles for select
  using (id = auth.uid() or current_role_name() = 'admin');

create policy profiles_admin_all on profiles for all
  using (current_role_name() = 'admin')
  with check (current_role_name() = 'admin');

-- pgs: leitura para qualquer usuário autenticado; escrita só admin
create policy pgs_authenticated_select on pgs for select
  using (auth.uid() is not null);

create policy pgs_admin_write on pgs for all
  using (current_role_name() = 'admin')
  with check (current_role_name() = 'admin');

-- visitantes ---------------------------------------------------------------
-- admin vê e edita tudo
create policy visitantes_admin_all on visitantes for all
  using (current_role_name() = 'admin')
  with check (current_role_name() = 'admin');

-- líder vê e edita apenas visitantes do seu PG
create policy visitantes_lider_select on visitantes for select
  using (current_role_name() = 'lider' and pg_id = current_pg_id());

create policy visitantes_lider_update on visitantes for update
  using (current_role_name() = 'lider' and pg_id = current_pg_id())
  with check (current_role_name() = 'lider' and pg_id = current_pg_id());

-- padrinho vê apenas seus afilhados
create policy visitantes_padrinho_select on visitantes for select
  using (padrinho_id = auth.uid());

-- recepcionista (ou admin) apenas insere
create policy visitantes_recep_insert on visitantes for insert
  with check (current_role_name() in ('recepcionista', 'admin'));

-- interacoes: acesso derivado do acesso ao visitante ------------------------
create policy interacoes_select_via_visitante on interacoes for select
  using (exists (select 1 from visitantes v where v.id = visitante_id));

create policy interacoes_insert_authenticated on interacoes for insert
  with check (auth.uid() is not null
    and exists (select 1 from visitantes v where v.id = visitante_id));

-- presencas_pg: mesma lógica de acesso via visitante
create policy presencas_select_via_visitante on presencas_pg for select
  using (exists (select 1 from visitantes v where v.id = visitante_id));

create policy presencas_insert_authenticated on presencas_pg for insert
  with check (auth.uid() is not null
    and exists (select 1 from visitantes v where v.id = visitante_id));
