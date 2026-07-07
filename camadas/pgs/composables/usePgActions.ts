/**
 * Ações de mutação sobre PGs: criar, editar, ativar/inativar e designar líder.
 * Responsabilidade única: validar (Zod) e persistir, refletindo na store.
 */
import { toErrorMessage } from '~/camadas/core/utils/error'
import type { Pg } from '~/types/pg'
import { pgSchema, type PgInput } from '~/schemas/pg'

export function usePgActions() {
  const store = usePgsStore()
  const repository = usePgsRepository()

  async function guarded(action: () => Promise<void>): Promise<boolean> {
    store.setError(null)
    try {
      await action()
      return true
    } catch (error) {
      store.setError(toErrorMessage(error))
      return false
    }
  }

  function validated(input: PgInput) {
    const parsed = pgSchema.safeParse(input)
    if (!parsed.success) {
      store.setError('validation')
      return null
    }
    return parsed.data
  }

  function createPg(input: PgInput): Promise<boolean> {
    const data = validated(input)
    if (!data) return Promise.resolve(false)
    return guarded(async () => {
      const created = await repository.insert({
        nome: data.nome,
        dia_semana: data.diaSemana,
        horario: data.horario,
        endereco: data.endereco,
        ativo: true
      })
      store.upsertPg(created)
    })
  }

  function updatePgDetails(pg: Pg, input: PgInput): Promise<boolean> {
    const data = validated(input)
    if (!data) return Promise.resolve(false)
    return guarded(async () => {
      const updated = await repository.update(pg.id, {
        nome: data.nome,
        dia_semana: data.diaSemana,
        horario: data.horario,
        endereco: data.endereco
      })
      store.upsertPg(updated)
    })
  }

  function toggleAtivo(pg: Pg, ativo: boolean): Promise<boolean> {
    return guarded(async () => {
      const updated = await repository.update(pg.id, { ativo })
      store.upsertPg(updated)
    })
  }

  /**
   * Designar líder mantém dois campos em sincronia: `pgs.lider_id` (quem lidera
   * este PG) e `profiles.pg_id` (a qual PG o líder pertence) — é esse segundo
   * campo que a RLS usa para o líder enxergar os visitantes do seu PG.
   */
  function assignLeader(pg: Pg, liderId: string | null): Promise<boolean> {
    return guarded(async () => {
      if (pg.liderId && pg.liderId !== liderId) {
        await repository.updateProfilePg(pg.liderId, null)
      }
      const updated = await repository.update(pg.id, { lider_id: liderId })
      if (liderId) await repository.updateProfilePg(liderId, pg.id)
      store.upsertPg(updated)
    })
  }

  return { createPg, updatePgDetails, toggleAtivo, assignLeader }
}
