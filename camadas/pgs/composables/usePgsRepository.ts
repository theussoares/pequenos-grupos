/**
 * Fronteira de acesso a dados dos PGs (Supabase). Responsabilidade única: I/O +
 * mapeamento de linhas para o domínio. Nenhuma regra de negócio aqui.
 */
import type { PgRow, ProfileRow } from '~/types/database'
import type { Pg } from '~/types/pg'
import type { Profile } from '~/types/profile'
import { toPg, toProfile } from '~/camadas/visitantes/domain/mappers'

export function usePgsRepository() {
  const supabase = useSupabaseClient()

  async function fetchAll(): Promise<Pg[]> {
    const { data, error } = await supabase.from('pgs').select('*').order('nome')
    if (error) throw error
    return (data as PgRow[]).map(toPg)
  }

  async function fetchLeaderCandidates(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'lider')
      .order('nome')
    if (error) throw error
    return (data as ProfileRow[]).map(toProfile)
  }

  async function insert(payload: Partial<PgRow>): Promise<Pg> {
    const { data, error } = await supabase
      .from('pgs')
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error
    return toPg(data as PgRow)
  }

  async function update(id: string, patch: Partial<PgRow>): Promise<Pg> {
    const { data, error } = await supabase
      .from('pgs')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return toPg(data as PgRow)
  }

  async function updateProfilePg(
    profileId: string,
    pgId: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ pg_id: pgId })
      .eq('id', profileId)
    if (error) throw error
  }

  return { fetchAll, fetchLeaderCandidates, insert, update, updateProfilePg }
}
