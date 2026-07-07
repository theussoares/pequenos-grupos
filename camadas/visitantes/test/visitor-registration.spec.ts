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

  it('rejects a non-positive or out-of-range age (max 2 digits)', () => {
    expect(
      visitorRegistrationSchema.safeParse({ nome: 'Ana', idade: 0 }).success
    ).toBe(false)
    expect(
      visitorRegistrationSchema.safeParse({ nome: 'Ana', idade: 100 }).success
    ).toBe(false)
    expect(
      visitorRegistrationSchema.safeParse({ nome: 'Ana', idade: 99 }).success
    ).toBe(true)
  })

  it('rejects an incomplete phone number', () => {
    expect(
      visitorRegistrationSchema.safeParse({ nome: 'Ana', telefone: '(11) 9 888' })
        .success
    ).toBe(false)
  })

  it('accepts a complete phone and strips the mask on parse', () => {
    const result = visitorRegistrationSchema.safeParse({
      nome: 'Ana',
      telefone: '(11) 9 88887777'
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.telefone).toBe('11988887777')
  })

  it('accepts bairro and pontoReferencia when provided', () => {
    const result = visitorRegistrationSchema.safeParse({
      nome: 'Ana',
      idade: 22,
      bairro: 'Centro',
      pontoReferencia: 'perto do mercado'
    })
    expect(result.success).toBe(true)
  })
})
