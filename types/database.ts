/**
 * Contrato mínimo das tabelas Supabase (snake_case, como no banco). As camadas
 * de aplicação trabalham com os tipos de domínio em camelCase; a conversão
 * acontece no repositório (`useVisitorsRepository`).
 *
 * Declarados como `type` (não `interface`) para que ganhem index signature
 * implícita e satisfaçam o `GenericTable` do postgrest-js.
 */

export type VisitorRow = {
  id: string
  nome: string
  telefone: string | null
  idade: number | null
  data_primeira_visita: string
  como_conheceu: string | null
  observacoes: string | null
  status: string
  pg_id: string | null
  padrinho_id: string | null
  cadastrado_por: string | null
  proximo_contato_em: string | null
  ultimo_contato_em: string | null
  amizade_confirmada: boolean
  responsabilidade: string | null
  status_changed_at: string
  created_at: string
  updated_at: string
}

export type InteractionRow = {
  id: string
  visitante_id: string
  autor_id: string | null
  tipo: string
  descricao: string | null
  status_anterior: string | null
  status_novo: string | null
  created_at: string
}

export type PgRow = {
  id: string
  nome: string
  dia_semana: number
  horario: string | null
  endereco: string | null
  lider_id: string | null
  ativo: boolean
  created_at: string
}

export type ProfileRow = {
  id: string
  nome: string
  telefone: string | null
  role: string
  pg_id: string | null
  created_at: string
}

export type PgPresenceRow = {
  id: string
  visitante_id: string
  pg_id: string
  data: string
  registrado_por: string | null
  created_at: string
}
