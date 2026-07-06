import { describe, expect, it } from 'vitest'
import { visitorRegistrationSchema } from '~/schemas/visitor-registration'

describe('visitorRegistrationSchema', () => {
  it('accepts a minimal valid registration (name only)', () => {
    expect(visitorRegistrationSchema.safeParse({ nome: 'João' }).success).toBe(
      true
    )
  })

  it('rejects an empty or whitespace-only name', () => {
    expect(visitorRegistrationSchema.safeParse({ nome: '' }).success).toBe(false)
    expect(visitorRegistrationSchema.safeParse({ nome: '   ' }).success).toBe(
      false
    )
  })

  it('rejects a non-positive or out-of-range age', () => {
    expect(
      visitorRegistrationSchema.safeParse({ nome: 'Ana', idade: 0 }).success
    ).toBe(false)
    expect(
      visitorRegistrationSchema.safeParse({ nome: 'Ana', idade: 200 }).success
    ).toBe(false)
  })

  it('accepts optional fields when provided', () => {
    const result = visitorRegistrationSchema.safeParse({
      nome: 'Ana',
      telefone: '11988887777',
      idade: 22,
      comoConheceu: 'Amigo'
    })
    expect(result.success).toBe(true)
  })
})
