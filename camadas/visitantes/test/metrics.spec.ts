import { describe, expect, it } from 'vitest'
import { computeFunnelMetrics } from '../domain/metrics'
import type { Visitor } from '~/types/visitor'
import type { VisitorStatus } from '../domain/visitor-status'

const NOW = new Date('2026-07-15T12:00:00.000Z')

function daysBefore(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

function visitor(
  id: string,
  status: VisitorStatus,
  overrides: Partial<Visitor> = {}
): Visitor {
  return {
    id,
    nome: `V${id}`,
    telefone: null,
    idade: null,
    dataPrimeiraVisita: '2026-07-05',
    bairro: null,
    pontoReferencia: null,
    observacoes: null,
    status,
    pgId: null,
    padrinhoId: null,
    cadastradoPor: null,
    proximoContatoEm: null,
    ultimoContatoEm: null,
    amizadeConfirmada: false,
    responsabilidade: null,
    statusChangedAt: daysBefore(1),
    createdAt: daysBefore(1),
    updatedAt: daysBefore(1),
    ...overrides
  }
}

describe('computeFunnelMetrics', () => {
  it('counts the month funnel cohort by reached milestone', () => {
    const metrics = computeFunnelMetrics(
      [
        visitor('1', 'novo'),
        visitor('2', 'contatado'),
        visitor('3', 'presente_pg'),
        visitor('4', 'em_vinculo'),
        visitor('5', 'integrado')
      ],
      NOW
    )
    expect(metrics.funnel).toEqual({
      novos: 5,
      contatados: 4,
      noPG: 3,
      emVinculo: 2
    })
    expect(metrics.conversion.contato).toBeCloseTo(4 / 5)
    expect(metrics.conversion.pg).toBeCloseTo(3 / 4)
  })

  it('excludes visitors from other months from the cohort', () => {
    const metrics = computeFunnelMetrics(
      [
        visitor('1', 'novo'),
        visitor('old', 'contatado', { dataPrimeiraVisita: '2026-05-01' })
      ],
      NOW
    )
    expect(metrics.monthCohortSize).toBe(1)
  })

  it('computes retention only over old-enough visitors', () => {
    const metrics = computeFunnelMetrics(
      [
        visitor('a', 'em_vinculo', { dataPrimeiraVisita: '2026-06-01' }),
        visitor('b', 'contatado', { dataPrimeiraVisita: '2026-06-01' }),
        visitor('young', 'em_vinculo', { dataPrimeiraVisita: '2026-07-10' })
      ],
      NOW
    )
    // only a and b are 30+ days old; a is retained
    expect(metrics.retention30).toBeCloseTo(1 / 2)
  })

  it('ranks overdue visitors by days overdue, limited', () => {
    const metrics = computeFunnelMetrics(
      [
        visitor('late', 'novo', { proximoContatoEm: daysBefore(5) }),
        visitor('later', 'contatado', { proximoContatoEm: daysBefore(2) }),
        visitor('ontime', 'novo', { proximoContatoEm: daysBefore(-3) })
      ],
      NOW,
      { overdueLimit: 5 }
    )
    expect(metrics.overdue.map((o) => o.visitorId)).toEqual(['late', 'later'])
    expect(metrics.overdue[0].daysOverdue).toBe(5)
  })

  it('builds a monthly trend of the requested length', () => {
    const metrics = computeFunnelMetrics([visitor('1', 'novo')], NOW, {
      trendMonths: 6
    })
    expect(metrics.monthlyTrend).toHaveLength(6)
    expect(metrics.monthlyTrend[5].month).toBe('2026-07')
    expect(metrics.monthlyTrend[5].count).toBe(1)
  })
})
