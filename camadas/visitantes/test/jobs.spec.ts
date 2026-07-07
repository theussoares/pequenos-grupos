import { describe, expect, it } from 'vitest'
import {
  canReceiveReactivation,
  isEligibleForIntegrado,
  isUnresponsive
} from '../domain/jobs'

const NOW = new Date('2026-07-15T12:00:00.000Z')

function daysBefore(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000)
}

describe('isEligibleForIntegrado', () => {
  const base = {
    status: 'em_vinculo' as const,
    firstVisitDate: daysBefore(120),
    presenceCount: 4,
    amizadeConfirmada: true,
    hasResponsabilidade: false,
    now: NOW
  }

  it('promotes when all conditions are met', () => {
    expect(isEligibleForIntegrado(base)).toBe(true)
  })

  it('accepts responsabilidade in place of confirmed friendship', () => {
    expect(
      isEligibleForIntegrado({
        ...base,
        amizadeConfirmada: false,
        hasResponsabilidade: true
      })
    ).toBe(true)
  })

  it('requires em_vinculo, 90+ days, 4+ presences and a bond signal', () => {
    expect(isEligibleForIntegrado({ ...base, status: 'presente_pg' })).toBe(false)
    expect(isEligibleForIntegrado({ ...base, firstVisitDate: daysBefore(80) })).toBe(false)
    expect(isEligibleForIntegrado({ ...base, presenceCount: 3 })).toBe(false)
    expect(
      isEligibleForIntegrado({
        ...base,
        amizadeConfirmada: false,
        hasResponsabilidade: false
      })
    ).toBe(false)
  })
})

describe('isUnresponsive', () => {
  const base = {
    status: 'contatado' as const,
    nextContactAt: daysBefore(8),
    lastInteractionAt: null,
    now: NOW
  }

  it('flags an open visitor overdue by 7+ days with no new interaction', () => {
    expect(isUnresponsive(base)).toBe(true)
  })

  it('does not flag when a newer interaction happened after the deadline', () => {
    expect(
      isUnresponsive({ ...base, lastInteractionAt: daysBefore(2) })
    ).toBe(false)
  })

  it('does not flag within the 7-day grace or without a deadline', () => {
    expect(isUnresponsive({ ...base, nextContactAt: daysBefore(3) })).toBe(false)
    expect(isUnresponsive({ ...base, nextContactAt: null })).toBe(false)
  })

  it('ignores non-open statuses', () => {
    expect(isUnresponsive({ ...base, status: 'integrado' })).toBe(false)
  })
})

describe('canReceiveReactivation', () => {
  it('allows sem_resposta/arquivado without a recent reactivation', () => {
    expect(
      canReceiveReactivation({
        status: 'sem_resposta',
        lastReactivationAt: null,
        now: NOW
      })
    ).toBe(true)
    expect(
      canReceiveReactivation({
        status: 'arquivado',
        lastReactivationAt: daysBefore(100),
        now: NOW
      })
    ).toBe(true)
  })

  it('blocks within the 90-day cooldown or for other statuses', () => {
    expect(
      canReceiveReactivation({
        status: 'sem_resposta',
        lastReactivationAt: daysBefore(30),
        now: NOW
      })
    ).toBe(false)
    expect(
      canReceiveReactivation({
        status: 'novo',
        lastReactivationAt: null,
        now: NOW
      })
    ).toBe(false)
  })
})
