import { describe, expect, it } from 'vitest'
import { FUNNEL_COLUMNS, groupByStatus } from '../domain/funnel-board'
import type { VisitorStatus } from '../domain/visitor-status'

function item(id: string, status: VisitorStatus) {
  return { id, status }
}

describe('funnel-board', () => {
  it('exposes the funnel columns in order', () => {
    expect(FUNNEL_COLUMNS[0]).toBe('novo')
    expect(FUNNEL_COLUMNS).toContain('integrado')
    expect(FUNNEL_COLUMNS).not.toContain('arquivado')
  })

  it('buckets items by status', () => {
    const grouped = groupByStatus([
      item('a', 'novo'),
      item('b', 'novo'),
      item('c', 'convidado')
    ])
    expect(grouped.novo.map((i) => i.id)).toEqual(['a', 'b'])
    expect(grouped.convidado.map((i) => i.id)).toEqual(['c'])
    expect(grouped.integrado).toEqual([])
  })

  it('drops items whose status is not a column (e.g. arquivado)', () => {
    const grouped = groupByStatus([item('x', 'arquivado')])
    const total = Object.values(grouped).reduce((sum, b) => sum + b.length, 0)
    expect(total).toBe(0)
  })
})
