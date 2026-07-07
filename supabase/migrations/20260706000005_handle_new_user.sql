-- Bootstrap de profiles: sem uma linha em `profiles`, o usuário fica sem papel e
-- a navegação por papel não mostra nada. Este trigger cria o profile no signup
-- com o papel padrão 'recepcionista' (o primeiro admin é promovido manualmente).

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, nome, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nome', ''),
      split_part(new.email, '@', 1)
    ),
    'recepcionista'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- Backfill: usuários já existentes que ainda não têm profile.
insert into profiles (id, nome, role)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'nome', ''), split_part(u.email, '@', 1)),
  'recepcionista'
from auth.users u
left join profiles p on p.id = u.id
where p.id is null;

-- Para promover o primeiro admin, rode manualmente:
--   update profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'voce@exemplo.com');
