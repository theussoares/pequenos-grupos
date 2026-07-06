import { describe, expect, it } from 'vitest'
import { nextStatusOnPresence } from '../domain/presence-transition'

describe('nextStatusOnPresence', () => {
  it('moves an invited visitor to presente_pg on first presence', () => {
    expect(nextStatusOnPresence('convidado')).toBe('presente_pg')
  })

  it('moves a present visitor to em_vinculo on a later presence', () => {
    expect(nextStatusOnPresence('presente_pg')).toBe('em_vinculo')
  })

  it('does not force an invalid transition', () => {
    expect(nextStatusOnPresence('novo')).toBeNull()
    expect(nextStatusOnPresence('integrado')).toBeNull()
  })
})
