-- Funil de assimilação de visitantes — schema base (§2.3 do PDF)
-- profiles e pgs têm FK circular (lider_id <-> pg_id): criamos as tabelas
-- primeiro e adicionamos essas FKs ao final.

create extension if not exists "pgcrypto";

-- profiles (estende auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  telefone text,
  role text not null default 'recepcionista'
    check (role in ('admin', 'lider', 'padrinho', 'recepcionista')),
  pg_id uuid,
  created_at timestamptz not null default now()
);

-- pgs (pequenos grupos)
create table if not exists pgs (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  dia_semana int not null check (dia_semana between 0 and 6),
  horario time,
  endereco text,
  lider_id uuid,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- visitantes
create table if not exists visitantes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  idade int,
  data_primeira_visita date not null default current_date,
  como_conheceu text,
  observacoes text,
  status text not null default 'novo'
    check (status in (
      'novo', 'contatado', 'convidado', 'presente_pg',
      'em_vinculo', 'integrado', 'sem_resposta', 'reativacao', 'arquivado'
    )),
  pg_id uuid references pgs (id),
  padrinho_id uuid references profiles (id),
  cadastrado_por uuid references profiles (id),
  proximo_contato_em timestamptz, -- deadline do SLA vigente
  ultimo_contato_em timestamptz,
  amizade_confirmada boolean not null default false, -- checkpoint dia 30
  responsabilidade text, -- função dada na etapa 5
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- interacoes (histórico / timeline)
create table if not exists interacoes (
  id uuid primary key default gen_random_uuid(),
  visitante_id uuid not null references visitantes (id) on delete cascade,
  autor_id uuid references profiles (id),
  tipo text not null check (tipo in (
    'mensagem', 'ligacao', 'presenca_pg',
    'presenca_culto', 'visita', 'mudanca_status', 'nota'
  )),
  descricao text,
  status_anterior text,
  status_novo text,
  created_at timestamptz not null default now()
);

-- presencas em PG (para métricas de retenção)
create table if not exists presencas_pg (
  id uuid primary key default gen_random_uuid(),
  visitante_id uuid not null references visitantes (id) on delete cascade,
  pg_id uuid not null references pgs (id),
  data date not null,
  registrado_por uuid references profiles (id),
  created_at timestamptz not null default now(),
  unique (visitante_id, data)
);

-- FKs circulares adicionadas após a criação das tabelas
alter table pgs
  add constraint pgs_lider_id_fkey
  foreign key (lider_id) references profiles (id);

alter table profiles
  add constraint profiles_pg_id_fkey
  foreign key (pg_id) references pgs (id);

-- Índices para a fila "Hoje" e filtros por PG/padrinho
create index if not exists visitantes_status_idx on visitantes (status);
create index if not exists visitantes_proximo_contato_idx
  on visitantes (proximo_contato_em);
create index if not exists visitantes_pg_id_idx on visitantes (pg_id);
create index if not exists visitantes_padrinho_id_idx on visitantes (padrinho_id);
create index if not exists interacoes_visitante_idx
  on interacoes (visitante_id, created_at desc);

-- Trigger de updated_at em visitantes
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger visitantes_set_updated_at
  before update on visitantes
  for each row
  execute function set_updated_at();
