import { describe, expect, it } from 'vitest'
import { pgSchema } from '~/schemas/pg'

describe('pgSchema', () => {
  it('accepts a minimal valid PG', () => {
    const result = pgSchema.safeParse({
      nome: 'PG Central',
      diaSemana: 4,
      horario: null,
      endereco: null
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty name', () => {
    expect(
      pgSchema.safeParse({
        nome: '',
        diaSemana: 0,
        horario: null,
        endereco: null
      }).success
    ).toBe(false)
  })

  it('rejects a weekday out of the 0-6 range', () => {
    expect(
      pgSchema.safeParse({
        nome: 'PG',
        diaSemana: 7,
        horario: null,
        endereco: null
      }).success
    ).toBe(false)
    expect(
      pgSchema.safeParse({
        nome: 'PG',
        diaSemana: -1,
        horario: null,
        endereco: null
      }).success
    ).toBe(false)
  })

  it('accepts horario and endereco when provided', () => {
    const result = pgSchema.safeParse({
      nome: 'PG Central',
      diaSemana: 4,
      horario: '19:30',
      endereco: 'Casa do Pedro'
    })
    expect(result.success).toBe(true)
  })
})
