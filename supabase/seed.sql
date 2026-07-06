-- Seed de desenvolvimento: PGs e visitantes de exemplo para a tela "Hoje".
-- Não cria profiles/usuários (dependem de auth.users). padrinho_id fica nulo.

insert into pgs (id, nome, dia_semana, horario)
values
  ('11111111-1111-1111-1111-111111111111', 'PG Central', 4, '19:30'),
  ('22222222-2222-2222-2222-222222222222', 'PG Zona Sul', 2, '20:00');

insert into visitantes
  (nome, telefone, idade, data_primeira_visita, status, pg_id, proximo_contato_em)
values
  ('João Pedro', '11988887777', 19, current_date - 2, 'novo', null,
    now() - interval '3 hours'),
  ('Maria Clara', '11977776666', 22, current_date - 5, 'contatado',
    '11111111-1111-1111-1111-111111111111', now() + interval '10 hours'),
  ('Lucas Andrade', '11966665555', 20, current_date - 10, 'convidado',
    '11111111-1111-1111-1111-111111111111', now() + interval '3 days'),
  ('Beatriz Souza', '11955554444', 18, current_date - 30, 'em_vinculo',
    '22222222-2222-2222-2222-222222222222', now() - interval '1 day');
