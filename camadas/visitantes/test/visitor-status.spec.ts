import { describe, expect, it } from 'vitest'
import {
  allowedTransitions,
  canTransition,
  isFinalStatus,
  isVisitorStatus,
  VISITOR_STATUSES
} from '../domain/visitor-status'

describe('visitor-status', () => {
  it('exposes the nine funnel statuses', () => {
    expect(VISITOR_STATUSES).toHaveLength(9)
  })

  it('allows only the transitions defined in the state machine', () => {
    expect(allowedTransitions('novo')).toEqual(['contatado', 'arquivado'])
    expect(allowedTransitions('convidado')).toEqual([
      'presente_pg',
      'sem_resposta'
    ])
    expect(allowedTransitions('arquivado')).toEqual(['reativacao'])
  })

  it('accepts valid transitions and rejects invalid ones', () => {
    expect(canTransition('novo', 'contatado')).toBe(true)
    expect(canTransition('novo', 'integrado')).toBe(false)
    expect(canTransition('em_vinculo', 'integrado')).toBe(true)
  })

  it('marks integrado as the only final status', () => {
    expect(isFinalStatus('integrado')).toBe(true)
    expect(isFinalStatus('novo')).toBe(false)
  })

  it('guards unknown status strings', () => {
    expect(isVisitorStatus('novo')).toBe(true)
    expect(isVisitorStatus('inexistente')).toBe(false)
  })
})
