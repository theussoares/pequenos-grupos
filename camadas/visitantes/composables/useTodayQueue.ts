/**
 * Deriva a fila "Hoje": enriquece cada visitante com urgência de SLA e ordena
 * por prioridade. Responsabilidade única: transformação/ordenação reativa —
 * sem I/O. Importa de 'vue' explicitamente para ser testável fora do Nuxt.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { Visitor, TodayAction } from '~/types/visitor'
import { slaUrgency, urgencyRank } from '~/camadas/visitantes/domain/sla'

interface TodayQueueOptions {
  visitors: Ref<Visitor[]>
  pgNameById: Ref<Record<string, string>>
  padrinhoNameById: Ref<Record<string, string>>
  now: Ref<Date>
}

export interface TodayQueue {
  actions: ComputedRef<TodayAction[]>
  overdueCount: ComputedRef<number>
  dueSoonCount: ComputedRef<number>
}

function toAction(
  visitor: Visitor,
  options: TodayQueueOptions
): TodayAction {
  const deadline = visitor.proximoContatoEm
    ? new Date(visitor.proximoContatoEm)
    : null
  return {
    visitor,
    deadline,
    urgency: slaUrgency(deadline, options.now.value),
    pgNome: visitor.pgId
      ? (options.pgNameById.value[visitor.pgId] ?? null)
      : null,
    padrinhoNome: visitor.padrinhoId
      ? (options.padrinhoNameById.value[visitor.padrinhoId] ?? null)
      : null
  }
}

function byUrgencyThenDeadline(a: TodayAction, b: TodayAction): number {
  const rankDiff = urgencyRank(a.urgency) - urgencyRank(b.urgency)
  if (rankDiff !== 0) return rankDiff

  const aTime = a.deadline?.getTime() ?? Number.POSITIVE_INFINITY
  const bTime = b.deadline?.getTime() ?? Number.POSITIVE_INFINITY
  return aTime - bTime
}

export function useTodayQueue(options: TodayQueueOptions): TodayQueue {
  const actions = computed(() =>
    options.visitors.value
      .map((visitor) => toAction(visitor, options))
      .sort(byUrgencyThenDeadline)
  )

  const overdueCount = computed(
    () => actions.value.filter((a) => a.urgency === 'overdue').length
  )

  const dueSoonCount = computed(
    () => actions.value.filter((a) => a.urgency === 'due-soon').length
  )

  return { actions, overdueCount, dueSoonCount }
}
