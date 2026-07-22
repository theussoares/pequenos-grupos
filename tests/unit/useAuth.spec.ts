import { describe, expect, it } from 'vitest'
import { isAlreadyRegistered } from '~/composables/useAuth'

describe('isAlreadyRegistered', () => {
  it('is true when identities is an empty array (Supabase leak-protection signal)', () => {
    expect(isAlreadyRegistered({ identities: [] })).toBe(true)
  })

  it('is false for a genuinely new user with an identity', () => {
    expect(isAlreadyRegistered({ identities: [{ id: 'x' }] })).toBe(false)
  })

  it('is false when identities is missing or null (defensive default)', () => {
    expect(isAlreadyRegistered({})).toBe(false)
    expect(isAlreadyRegistered({ identities: null })).toBe(false)
    expect(isAlreadyRegistered(null)).toBe(false)
  })
})
