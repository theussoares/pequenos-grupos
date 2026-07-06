-- Fase 2: rastrear quando o visitante entrou no status atual, para o card do
-- Kanban exibir "dias no status" (§2.6). updated_at muda em qualquer alteração,
-- então precisamos de uma coluna dedicada.

alter table visitantes
  add column if not exists status_changed_at timestamptz not null default now();

-- Backfill: registros existentes assumem o momento da criação como entrada no
-- status atual (aproximação razoável para dados já migrados).
update visitantes
  set status_changed_at = created_at
  where status_changed_at is null;
