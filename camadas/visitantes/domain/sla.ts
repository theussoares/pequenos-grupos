/**
 * Regras de SLA do funil (§2.5 do PDF). Domínio puro e testável: recebe datas
 * como entrada, devolve a próxima deadline e a urgência — sem tocar em relógio
 * global implícito nem em I/O.
 */
import type { VisitorStatus } from './visitor-status'

const HOURS = 60 * 60 * 1000
const DAYS = 24 * HOURS

const DUE_SOON_WINDOW_MS = 24 * HOURS

/** Offset em milissegundos a partir do momento de entrada no status. */
const OFFSET_FROM_ENTRY_MS: Partial<Record<VisitorStatus, number>> = {
  novo: 36 * HOURS,
  contatado: 7 * DAYS,
  convidado: 14 * DAYS,
  reativacao: 14 * DAYS
}

/** Offset a partir da data da primeira visita (checkpoint dia 30). */
const OFFSET_FROM_FIRST_VISIT_MS: Partial<Record<VisitorStatus, number>> = {
  em_vinculo: 30 * DAYS
}

export interface DeadlineInput {
  status: VisitorStatus
  enteredAt: Date
  firstVisitDate: Date
}

/**
 * Calcula `proximo_contato_em` para o status recém-assumido. Retorna `null`
 * quando o status não tem SLA (presente_pg, integrado, sem_resposta, arquivado).
 */
export function computeNextContactDeadline(input: DeadlineInput): Date | null {
  const fromFirstVisit = OFFSET_FROM_FIRST_VISIT_MS[input.status]
  if (fromFirstVisit !== undefined) {
    return new Date(input.firstVisitDate.getTime() + fromFirstVisit)
  }

  const fromEntry = OFFSET_FROM_ENTRY_MS[input.status]
  if (fromEntry !== undefined) {
    return new Date(input.enteredAt.getTime() + fromEntry)
  }

  return null
}

export type SlaUrgency = 'overdue' | 'due-soon' | 'on-track' | 'none'

/** Classifica a urgência de uma deadline em relação a `now`. */
export function slaUrgency(deadline: Date | null, now: Date): SlaUrgency {
  if (!deadline) return 'none'

  const remaining = deadline.getTime() - now.getTime()
  if (remaining < 0) return 'overdue'
  if (remaining <= DUE_SOON_WINDOW_MS) return 'due-soon'
  return 'on-track'
}

/** Peso para ordenação da fila "Hoje": menor = mais urgente. */
export function urgencyRank(urgency: SlaUrgency): number {
  const ranks: Record<SlaUrgency, number> = {
    overdue: 0,
    'due-soon': 1,
    'on-track': 2,
    none: 3
  }
  return ranks[urgency]
}
