/**
 * Métricas do funil (§1.7 e §2.6). Domínio puro e testável: recebe a lista de
 * visitantes + `now` e devolve os números agregados — sem I/O nem relógio global.
 *
 * Como só temos o status atual (não o histórico completo), cada marco é inferido
 * do conjunto de status que necessariamente já passaram por ele.
 */
import type { Visitor } from '~/types/visitor'
import type { VisitorStatus } from './visitor-status'

const DAY_MS = 24 * 60 * 60 * 1000

const CONTACTED = new Set<VisitorStatus>([
  'contatado',
  'convidado',
  'presente_pg',
  'em_vinculo',
  'integrado',
  'sem_resposta',
  'reativacao'
])
const REACHED_PG = new Set<VisitorStatus>(['presente_pg', 'em_vinculo', 'integrado'])
const RETAINED_30 = new Set<VisitorStatus>(['em_vinculo', 'integrado'])
const RETAINED_90 = new Set<VisitorStatus>(['integrado'])
const OPEN = new Set<VisitorStatus>([
  'novo',
  'contatado',
  'convidado',
  'presente_pg',
  'em_vinculo',
  'reativacao'
])

export interface FunnelStageCount {
  novos: number
  contatados: number
  noPG: number
  emVinculo: number
}

export interface OverdueEntry {
  visitorId: string
  nome: string
  daysOverdue: number
}

export interface MonthlyPoint {
  month: string
  count: number
}

export interface FunnelMetrics {
  monthCohortSize: number
  funnel: FunnelStageCount
  conversion: {
    contato: number | null
    pgOfCohort: number | null
    pg: number | null
    vinculo: number | null
  }
  retention30: number | null
  retention90: number | null
  vinculoRate: number | null
  overdue: OverdueEntry[]
  monthlyTrend: MonthlyPoint[]
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function ageInDays(firstVisit: Date, now: Date): number {
  return Math.floor((now.getTime() - firstVisit.getTime()) / DAY_MS)
}

function ratio(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator
}

function countIn(visitors: Visitor[], statuses: Set<VisitorStatus>): number {
  return visitors.filter((v) => statuses.has(v.status)).length
}

function computeFunnel(monthCohort: Visitor[]): FunnelStageCount {
  return {
    novos: monthCohort.length,
    contatados: countIn(monthCohort, CONTACTED),
    noPG: countIn(monthCohort, REACHED_PG),
    emVinculo: countIn(monthCohort, RETAINED_30)
  }
}

function retentionRate(
  visitors: Visitor[],
  now: Date,
  minAge: number,
  retained: Set<VisitorStatus>
): number | null {
  const eligible = visitors.filter(
    (v) =>
      v.status !== 'arquivado' &&
      ageInDays(new Date(v.dataPrimeiraVisita), now) >= minAge
  )
  return ratio(countIn(eligible, retained), eligible.length)
}

function computeOverdue(
  visitors: Visitor[],
  now: Date,
  limit: number
): OverdueEntry[] {
  return visitors
    .filter(
      (v) =>
        OPEN.has(v.status) &&
        v.proximoContatoEm !== null &&
        new Date(v.proximoContatoEm).getTime() < now.getTime()
    )
    .map((v) => ({
      visitorId: v.id,
      nome: v.nome,
      daysOverdue: ageInDays(new Date(v.proximoContatoEm as string), now)
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, limit)
}

function buildTrend(visitors: Visitor[], now: Date, months: number): MonthlyPoint[] {
  const points: MonthlyPoint[] = []
  for (let offset = months - 1; offset >= 0; offset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const key = monthKey(monthDate)
    const count = visitors.filter(
      (v) => monthKey(new Date(v.dataPrimeiraVisita)) === key
    ).length
    points.push({ month: key, count })
  }
  return points
}

export function computeFunnelMetrics(
  visitors: Visitor[],
  now: Date,
  options: { trendMonths?: number; overdueLimit?: number } = {}
): FunnelMetrics {
  const trendMonths = options.trendMonths ?? 6
  const overdueLimit = options.overdueLimit ?? 5

  const monthCohort = visitors.filter(
    (v) => monthKey(new Date(v.dataPrimeiraVisita)) === monthKey(now)
  )
  const funnel = computeFunnel(monthCohort)
  const active = visitors.filter((v) => v.status !== 'arquivado')

  return {
    monthCohortSize: monthCohort.length,
    funnel,
    conversion: {
      contato: ratio(funnel.contatados, funnel.novos),
      pgOfCohort: ratio(funnel.noPG, funnel.novos),
      pg: ratio(funnel.noPG, funnel.contatados),
      vinculo: ratio(funnel.emVinculo, funnel.noPG)
    },
    retention30: retentionRate(visitors, now, 30, RETAINED_30),
    retention90: retentionRate(visitors, now, 90, RETAINED_90),
    vinculoRate: ratio(
      active.filter((v) => v.amizadeConfirmada).length,
      active.length
    ),
    overdue: computeOverdue(visitors, now, overdueLimit),
    monthlyTrend: buildTrend(visitors, now, trendMonths)
  }
}
