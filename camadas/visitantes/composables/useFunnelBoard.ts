/**
 * Deriva as colunas do Kanban a partir dos visitantes do board: agrupa por
 * status e enriquece cada card com "dias no status" e flag de SLA vencido.
 * Responsabilidade única: transformação reativa — sem I/O.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { Visitor, BoardCard } from '~/types/visitor'
import {
  FUNNEL_COLUMNS,
  groupByStatus,
  type FunnelColumnStatus
} from '~/camadas/visitantes/domain/funnel-board'
import { daysInStatus } from '~/camadas/visitantes/domain/status-duration'
import { slaUrgency } from '~/camadas/visitantes/domain/sla'

interface FunnelBoardOptions {
  visitors: Ref<Visitor[]>
  padrinhoNameById: Ref<Record<string, string>>
  now: Ref<Date>
}

export interface FunnelColumn {
  status: FunnelColumnStatus
  cards: BoardCard[]
}

export function useFunnelBoard(options: FunnelBoardOptions): {
  columns: ComputedRef<FunnelColumn[]>
} {
  function toCard(visitor: Visitor): BoardCard {
    const deadline = visitor.proximoContatoEm
      ? new Date(visitor.proximoContatoEm)
      : null
    return {
      visitor,
      padrinhoNome: visitor.padrinhoId
        ? (options.padrinhoNameById.value[visitor.padrinhoId] ?? null)
        : null,
      daysInStatus: daysInStatus(
        new Date(visitor.statusChangedAt),
        options.now.value
      ),
      isOverdue: slaUrgency(deadline, options.now.value) === 'overdue'
    }
  }

  const columns = computed<FunnelColumn[]>(() => {
    const grouped = groupByStatus(options.visitors.value)
    return FUNNEL_COLUMNS.map((status) => ({
      status,
      cards: grouped[status].map(toCard)
    }))
  })

  return { columns }
}
