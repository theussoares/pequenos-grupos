/**
 * Colunas do Kanban do funil (§2.6). Domínio puro: define a ordem das colunas e
 * agrupa itens por status.
 */
import type { VisitorStatus } from './visitor-status'

export const FUNNEL_COLUMNS = [
  'novo',
  'contatado',
  'convidado',
  'presente_pg',
  'em_vinculo',
  'integrado',
  'sem_resposta',
  'reativacao'
] as const satisfies readonly VisitorStatus[]

export type FunnelColumnStatus = (typeof FUNNEL_COLUMNS)[number]

export function groupByStatus<T extends { status: VisitorStatus }>(
  items: T[]
): Record<FunnelColumnStatus, T[]> {
  const groups = Object.fromEntries(
    FUNNEL_COLUMNS.map((status) => [status, [] as T[]])
  ) as Record<FunnelColumnStatus, T[]>

  for (const item of items) {
    const bucket = groups[item.status as FunnelColumnStatus]
    if (bucket) bucket.push(item)
  }

  return groups
}
