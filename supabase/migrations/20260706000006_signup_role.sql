-- Papel escolhido no cadastro: o formulário de "Criar conta" envia o papel em
-- raw_user_meta_data->>'role'. O trigger valida contra uma whitelist — 'admin'
-- NUNCA é aceito via signup (promoção só por SQL manual).

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := new.raw_user_meta_data ->> 'role';
  if requested_role not in ('recepcionista', 'lider', 'padrinho') then
    requested_role := 'recepcionista';
  end if;

  insert into profiles (id, nome, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nome', ''),
      split_part(new.email, '@', 1)
    ),
    requested_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
