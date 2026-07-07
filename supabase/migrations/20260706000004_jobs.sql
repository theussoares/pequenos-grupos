-- Fase 3: jobs automáticos do funil (§2.5 do PDF).
-- As regras espelham camadas/visitantes/domain/jobs.ts (mesmos limites).
--
-- pg_cron precisa estar habilitado no projeto (Dashboard → Database → Extensions,
-- ou o CREATE EXTENSION abaixo). As funções são SECURITY DEFINER para rodarem
-- pelo agendador (postgres), fora do contexto de RLS.

create extension if not exists pg_cron;

-- 1) Promoção a integrado -----------------------------------------------------
-- em_vinculo há 90+ dias, 4+ presenças e (amizade confirmada OU responsabilidade).
create or replace function run_promote_to_integrado()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  with promoted as (
    update visitantes v
    set status = 'integrado',
        status_changed_at = now(),
        proximo_contato_em = null,
        updated_at = now()
    where v.status = 'em_vinculo'
      and v.data_primeira_visita <= current_date - interval '90 days'
      and (v.amizade_confirmada = true or v.responsabilidade is not null)
      and (
        select count(*) from presencas_pg p where p.visitante_id = v.id
      ) >= 4
    returning v.id
  ),
  logged as (
    insert into interacoes (visitante_id, tipo, status_anterior, status_novo)
    select id, 'mudanca_status', 'em_vinculo', 'integrado' from promoted
    returning 1
  )
  select count(*) into affected from logged;
  return affected;
end;
$$;

-- 2) Detecção de sem_resposta -------------------------------------------------
-- SLA vencido há 7+ dias e nenhuma interação nova depois do vencimento.
create or replace function run_detect_sem_resposta()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  with stale as (
    update visitantes v
    set status = 'sem_resposta',
        status_changed_at = now(),
        proximo_contato_em = null,
        updated_at = now()
    where v.status in (
        'novo', 'contatado', 'convidado', 'presente_pg', 'em_vinculo', 'reativacao'
      )
      and v.proximo_contato_em is not null
      and v.proximo_contato_em < now() - interval '7 days'
      and not exists (
        select 1 from interacoes i
        where i.visitante_id = v.id
          and i.created_at > v.proximo_contato_em
      )
    returning v.id, v.status
  ),
  logged as (
    insert into interacoes (visitante_id, tipo, status_anterior, status_novo)
    select id, 'mudanca_status', status, 'sem_resposta' from stale
    returning 1
  )
  select count(*) into affected from logged;
  return affected;
end;
$$;

-- 3) Campanha de reativação (execução manual/controlada) ----------------------
-- Move sem_resposta/arquivado para reativacao, respeitando o anti-spam de 90 dias.
-- NÃO é agendada: dispare sob demanda (ex.: `select run_reactivation_campaign();`).
create or replace function run_reactivation_campaign()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  with eligible as (
    select v.id, v.status as prev
    from visitantes v
    where v.status in ('sem_resposta', 'arquivado')
      and not exists (
        select 1 from interacoes i
        where i.visitante_id = v.id
          and i.status_novo = 'reativacao'
          and i.created_at > now() - interval '90 days'
      )
  ),
  moved as (
    update visitantes v
    set status = 'reativacao',
        status_changed_at = now(),
        proximo_contato_em = now() + interval '14 days',
        updated_at = now()
    from eligible e
    where v.id = e.id
    returning v.id, e.prev
  ),
  logged as (
    insert into interacoes (visitante_id, tipo, status_anterior, status_novo, descricao)
    select id, 'mudanca_status', prev, 'reativacao', 'Campanha de reativação'
    from moved
    returning 1
  )
  select count(*) into affected from logged;
  return affected;
end;
$$;

-- Agendamento diário (idempotente): remove agendamentos anteriores e recria.
do $$
begin
  perform cron.unschedule('promote-integrado')
  where exists (select 1 from cron.job where jobname = 'promote-integrado');
  perform cron.unschedule('detect-sem-resposta')
  where exists (select 1 from cron.job where jobname = 'detect-sem-resposta');
end;
$$;

select cron.schedule(
  'promote-integrado', '0 5 * * *', $$select run_promote_to_integrado()$$
);
select cron.schedule(
  'detect-sem-resposta', '10 5 * * *', $$select run_detect_sem_resposta()$$
);
