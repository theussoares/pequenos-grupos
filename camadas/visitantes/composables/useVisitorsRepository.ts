/**
 * Fronteira de acesso a dados (Supabase). Responsabilidade única: I/O + mapeamento
 * de linhas para o domínio. Nenhuma regra de negócio nem estado de UI aqui.
 */
import type {
  InteractionRow,
  PgRow,
  ProfileRow,
  VisitorRow
} from '~/types/database'
import type { Visitor } from '~/types/visitor'
import type { Interaction } from '~/types/interaction'
import type { Pg } from '~/types/pg'
import type { Profile } from '~/types/profile'
import {
  toInteraction,
  toPg,
  toProfile,
  toVisitor
} from '~/camadas/visitantes/domain/mappers'

const OPEN_STATUSES = [
  'novo',
  'contatado',
  'convidado',
  'presente_pg',
  'em_vinculo',
  'reativacao'
]

const PADRINHO_ROLES = ['padrinho', 'lider', 'admin']

type InteractionInsert = Omit<InteractionRow, 'id' | 'created_at'>
type PresenceInsert = {
  visitante_id: string
  pg_id: string
  data: string
  registrado_por: string | null
}

export function useVisitorsRepository() {
  const supabase = useSupabaseClient()

  async function fetchQueue(): Promise<Visitor[]> {
    const { data, error } = await supabase
      .from('visitantes')
      .select('*')
      .in('status', OPEN_STATUSES)
      .order('proximo_contato_em', { ascending: true, nullsFirst: false })
    if (error) throw error
    return (data as VisitorRow[]).map(toVisitor)
  }

  async function fetchBoard(): Promise<Visitor[]> {
    const { data, error } = await supabase
      .from('visitantes')
      .select('*')
      .neq('status', 'arquivado')
      .order('proximo_contato_em', { ascending: true, nullsFirst: false })
    if (error) throw error
    return (data as VisitorRow[]).map(toVisitor)
  }

  async function fetchAllVisitors(): Promise<Visitor[]> {
    const { data, error } = await supabase.from('visitantes').select('*')
    if (error) throw error
    return (data as VisitorRow[]).map(toVisitor)
  }

  async function fetchAfilhados(padrinhoId: string): Promise<Visitor[]> {
    const { data, error } = await supabase
      .from('visitantes')
      .select('*')
      .eq('padrinho_id', padrinhoId)
      .neq('status', 'arquivado')
      .order('nome')
    if (error) throw error
    return (data as VisitorRow[]).map(toVisitor)
  }

  async function fetchCurrentProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    return data ? toProfile(data as ProfileRow) : null
  }

  async function fetchVisitor(id: string): Promise<Visitor | null> {
    const { data, error } = await supabase
      .from('visitantes')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? toVisitor(data as VisitorRow) : null
  }

  async function fetchTimeline(visitorId: string): Promise<Interaction[]> {
    const { data, error } = await supabase
      .from('interacoes')
      .select('*, autor:profiles(nome)')
      .eq('visitante_id', visitorId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as (InteractionRow & { autor: { nome: string } | null })[]).map(
      (row) => toInteraction(row, row.autor?.nome ?? null)
    )
  }

  async function fetchPgs(): Promise<Pg[]> {
    const { data, error } = await supabase
      .from('pgs')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    if (error) throw error
    return (data as PgRow[]).map(toPg)
  }

  async function fetchPotentialPadrinhos(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', PADRINHO_ROLES)
      .order('nome')
    if (error) throw error
    return (data as ProfileRow[]).map(toProfile)
  }

  async function updateVisitor(
    id: string,
    patch: Partial<VisitorRow>
  ): Promise<Visitor> {
    const { data, error } = await supabase
      .from('visitantes')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return toVisitor(data as VisitorRow)
  }

  async function insertVisitor(payload: Partial<VisitorRow>): Promise<void> {
    const { error } = await supabase.from('visitantes').insert(payload)
    if (error) throw error
  }

  async function insertInteraction(payload: InteractionInsert): Promise<void> {
    const { error } = await supabase.from('interacoes').insert(payload)
    if (error) throw error
  }

  async function insertPresence(payload: PresenceInsert): Promise<void> {
    const { error } = await supabase.from('presencas_pg').insert(payload)
    if (error) throw error
  }

  return {
    fetchQueue,
    fetchBoard,
    fetchAllVisitors,
    fetchAfilhados,
    fetchCurrentProfile,
    fetchVisitor,
    fetchTimeline,
    fetchPgs,
    fetchPotentialPadrinhos,
    insertVisitor,
    updateVisitor,
    insertInteraction,
    insertPresence
  }
}
