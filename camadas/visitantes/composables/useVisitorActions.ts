/**
 * Ações de mutação sobre um visitante. Responsabilidade única: aplicar regras de
 * negócio (transições válidas + SLA) e persistir, refletindo na store. Toda ação
 * que muda estado registra uma linha em `interacoes`.
 */
import type { Visitor } from '~/types/visitor'
import type { VisitorStatus } from '~/camadas/visitantes/domain/visitor-status'
import type { InteractionType } from '~/camadas/visitantes/domain/interaction-type'
import { canTransition } from '~/camadas/visitantes/domain/visitor-status'
import { computeNextContactDeadline } from '~/camadas/visitantes/domain/sla'
import { nextStatusOnPresence } from '~/camadas/visitantes/domain/presence-transition'
import { toErrorMessage } from '~/camadas/core/utils/error'

export function useVisitorActions() {
  const store = useVisitorsStore()
  const repository = useVisitorsRepository()
  const user = useSupabaseUser()

  const authorId = (): string | null => user.value?.id ?? null

  async function persistPatch(
    visitor: Visitor,
    patch: Record<string, unknown>
  ): Promise<void> {
    const updated = await repository.updateVisitor(visitor.id, patch)
    store.upsertVisitor(updated)
  }

  async function refreshTimeline(visitorId: string): Promise<void> {
    store.setTimeline(await repository.fetchTimeline(visitorId))
  }

  async function guarded(action: () => Promise<void>): Promise<void> {
    store.setError(null)
    try {
      await action()
    } catch (error) {
      store.setError(toErrorMessage(error))
    }
  }

  function advanceStatus(visitor: Visitor, to: VisitorStatus): Promise<void> {
    return guarded(async () => {
      if (!canTransition(visitor.status, to)) return
      const now = new Date()
      const deadline = computeNextContactDeadline({
        status: to,
        enteredAt: now,
        firstVisitDate: new Date(visitor.dataPrimeiraVisita)
      })
      await persistPatch(visitor, {
        status: to,
        proximo_contato_em: deadline ? deadline.toISOString() : null,
        ultimo_contato_em: now.toISOString()
      })
      await repository.insertInteraction({
        visitante_id: visitor.id,
        autor_id: authorId(),
        tipo: 'mudanca_status',
        descricao: null,
        status_anterior: visitor.status,
        status_novo: to
      })
      await refreshTimeline(visitor.id)
    })
  }

  function registerInteraction(
    visitor: Visitor,
    tipo: InteractionType,
    descricao: string | null = null
  ): Promise<void> {
    return guarded(async () => {
      await repository.insertInteraction({
        visitante_id: visitor.id,
        autor_id: authorId(),
        tipo,
        descricao,
        status_anterior: null,
        status_novo: null
      })
      await persistPatch(visitor, { ultimo_contato_em: new Date().toISOString() })
      await refreshTimeline(visitor.id)
    })
  }

  function registerPresence(visitor: Visitor): Promise<void> {
    return guarded(async () => {
      if (!visitor.pgId) throw new Error('pg_required')
      await repository.insertPresence({
        visitante_id: visitor.id,
        pg_id: visitor.pgId,
        data: new Date().toISOString().slice(0, 10),
        registrado_por: authorId()
      })
      await repository.insertInteraction({
        visitante_id: visitor.id,
        autor_id: authorId(),
        tipo: 'presenca_pg',
        descricao: null,
        status_anterior: null,
        status_novo: null
      })
      const next = nextStatusOnPresence(visitor.status)
      if (next) return void (await advanceStatus(visitor, next))
      await refreshTimeline(visitor.id)
    })
  }

  function toggleAmizade(visitor: Visitor, confirmed: boolean): Promise<void> {
    return guarded(() =>
      persistPatch(visitor, { amizade_confirmada: confirmed })
    )
  }

  function assignPadrinho(
    visitor: Visitor,
    padrinhoId: string | null
  ): Promise<void> {
    return guarded(() => persistPatch(visitor, { padrinho_id: padrinhoId }))
  }

  function assignPg(visitor: Visitor, pgId: string | null): Promise<void> {
    return guarded(() => persistPatch(visitor, { pg_id: pgId }))
  }

  function setResponsabilidade(
    visitor: Visitor,
    responsabilidade: string | null
  ): Promise<void> {
    return guarded(() => persistPatch(visitor, { responsabilidade }))
  }

  return {
    advanceStatus,
    registerInteraction,
    registerPresence,
    toggleAmizade,
    assignPadrinho,
    assignPg,
    setResponsabilidade
  }
}
