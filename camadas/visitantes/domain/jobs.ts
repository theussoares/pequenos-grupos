/**
 * Regras dos jobs automáticos do funil (§2.5 do PDF). Domínio puro e testável:
 * predicados de elegibilidade que a migration SQL (pg_cron) espelha. Se um dia a
 * execução migrar para uma edge function em TS, estes predicados são reusados.
 */
import type { VisitorStatus } from './visitor-status'

const DAY_MS = 24 * 60 * 60 * 1000

export const INTEGRADO_MIN_DAYS = 90
export const INTEGRADO_MIN_PRESENCES = 4
export const UNRESPONSIVE_GRACE_DAYS = 7
export const REACTIVATION_COOLDOWN_DAYS = 90

const OPEN_STATUSES = new Set<VisitorStatus>([
  'novo',
  'contatado',
  'convidado',
  'presente_pg',
  'em_vinculo',
  'reativacao'
])

function daysBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / DAY_MS
}

/**
 * Promoção a `integrado`: em vínculo há 90+ dias desde a 1ª visita, com 4+
 * presenças e (amizade confirmada OU responsabilidade preenchida).
 */
export function isEligibleForIntegrado(input: {
  status: VisitorStatus
  firstVisitDate: Date
  presenceCount: number
  amizadeConfirmada: boolean
  hasResponsabilidade: boolean
  now: Date
}): boolean {
  if (input.status !== 'em_vinculo') return false
  if (daysBetween(input.firstVisitDate, input.now) < INTEGRADO_MIN_DAYS) {
    return false
  }
  if (input.presenceCount < INTEGRADO_MIN_PRESENCES) return false
  return input.amizadeConfirmada || input.hasResponsabilidade
}

/**
 * Detecção de `sem_resposta`: SLA venceu há 7+ dias e nenhuma interação nova
 * aconteceu depois do vencimento.
 */
export function isUnresponsive(input: {
  status: VisitorStatus
  nextContactAt: Date | null
  lastInteractionAt: Date | null
  now: Date
}): boolean {
  if (!OPEN_STATUSES.has(input.status)) return false
  if (!input.nextContactAt) return false
  if (daysBetween(input.nextContactAt, input.now) < UNRESPONSIVE_GRACE_DAYS) {
    return false
  }
  if (
    input.lastInteractionAt &&
    input.lastInteractionAt.getTime() > input.nextContactAt.getTime()
  ) {
    return false
  }
  return true
}

/**
 * Anti-spam relacional: só entra na campanha quem está em `sem_resposta` ou
 * `arquivado` e não recebeu reativação nos últimos 90 dias.
 */
export function canReceiveReactivation(input: {
  status: VisitorStatus
  lastReactivationAt: Date | null
  now: Date
}): boolean {
  if (input.status !== 'sem_resposta' && input.status !== 'arquivado') {
    return false
  }
  if (
    input.lastReactivationAt &&
    daysBetween(input.lastReactivationAt, input.now) < REACTIVATION_COOLDOWN_DAYS
  ) {
    return false
  }
  return true
}
