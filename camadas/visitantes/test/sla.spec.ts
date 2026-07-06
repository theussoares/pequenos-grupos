import { describe, expect, it } from 'vitest'
import {
  computeNextContactDeadline,
  slaUrgency,
  urgencyRank
} from '../domain/sla'

const enteredAt = new Date('2026-07-06T12:00:00.000Z')
const firstVisitDate = new Date('2026-07-01T00:00:00.000Z')

function hoursFrom(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * 60 * 60 * 1000)
}

describe('computeNextContactDeadline', () => {
  it('gives novo 36h from entry', () => {
    const deadline = computeNextContactDeadline({
      status: 'novo',
      enteredAt,
      firstVisitDate
    })
    expect(deadline).toEqual(hoursFrom(enteredAt, 36))
  })

  it('gives contatado 7 days and convidado 14 days from entry', () => {
    expect(
      computeNextContactDeadline({ status: 'contatado', enteredAt, firstVisitDate })
    ).toEqual(hoursFrom(enteredAt, 24 * 7))
    expect(
      computeNextContactDeadline({ status: 'convidado', enteredAt, firstVisitDate })
    ).toEqual(hoursFrom(enteredAt, 24 * 14))
  })

  it('anchors em_vinculo checkpoint 30 days after the first visit', () => {
    expect(
      computeNextContactDeadline({ status: 'em_vinculo', enteredAt, firstVisitDate })
    ).toEqual(hoursFrom(firstVisitDate, 24 * 30))
  })

  it('gives reativacao 14 days from entry', () => {
    expect(
      computeNextContactDeadline({ status: 'reativacao', enteredAt, firstVisitDate })
    ).toEqual(hoursFrom(enteredAt, 24 * 14))
  })

  it('has no deadline for statuses without SLA', () => {
    for (const status of [
      'presente_pg',
      'integrado',
      'sem_resposta',
      'arquivado'
    ] as const) {
      expect(
        computeNextContactDeadline({ status, enteredAt, firstVisitDate })
      ).toBeNull()
    }
  })
})

describe('slaUrgency', () => {
  const now = new Date('2026-07-06T12:00:00.000Z')

  it('is none when there is no deadline', () => {
    expect(slaUrgency(null, now)).toBe('none')
  })

  it('is overdue when the deadline already passed', () => {
    expect(slaUrgency(hoursFrom(now, -1), now)).toBe('overdue')
  })

  it('is due-soon within the next 24h', () => {
    expect(slaUrgency(hoursFrom(now, 5), now)).toBe('due-soon')
  })

  it('is on-track when beyond 24h', () => {
    expect(slaUrgency(hoursFrom(now, 48), now)).toBe('on-track')
  })
})

describe('urgencyRank', () => {
  it('sorts overdue first and none last', () => {
    expect(urgencyRank('overdue')).toBeLessThan(urgencyRank('due-soon'))
    expect(urgencyRank('due-soon')).toBeLessThan(urgencyRank('on-track'))
    expect(urgencyRank('on-track')).toBeLessThan(urgencyRank('none'))
  })
})
