import { describe, expect, it } from 'vitest'
import { daysInStatus } from '../domain/status-duration'

const now = new Date('2026-07-06T12:00:00.000Z')

function daysAgo(days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

describe('daysInStatus', () => {
  it('is zero on the same moment', () => {
    expect(daysInStatus(now, now)).toBe(0)
  })

  it('counts whole days elapsed', () => {
    expect(daysInStatus(daysAgo(3), now)).toBe(3)
    expect(daysInStatus(daysAgo(0.9), now)).toBe(0)
  })

  it('never goes negative', () => {
    expect(daysInStatus(daysAgo(-5), now)).toBe(0)
  })
})
