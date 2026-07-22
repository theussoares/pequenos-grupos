-- Amplia o papel do líder de PG (§1.2): cadastrar visitante (recepção) e
-- enxergar padrinhos/líderes para poder designar padrinho aos visitantes do
-- seu grupo. Políticas adicionais (permissivas, somam com as existentes) —
-- nenhuma política anterior é alterada ou removida.

-- líder também pode cadastrar visitante — a recepção é genérica (há líder que
-- cobre escala de recepção), então o cadastro não direciona a nenhum PG ainda;
-- a coordenação tria e designa o PG depois, igual ao fluxo da recepcionista.
create policy visitantes_lider_insert on visitantes for insert
  with check (current_role_name() = 'lider' and pg_id is null);

-- diretório mínimo: qualquer autenticado enxerga nome/telefone de padrinhos e
-- líderes — necessário para popular os seletores de padrinho/líder na UI.
-- Não expõe recepcionistas nem outros admins.
create policy profiles_directory_select on profiles for select
  using (role in ('padrinho', 'lider'));
