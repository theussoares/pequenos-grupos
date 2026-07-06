import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { Visitor } from '~/types/visitor'
import { useTodayQueue } from '../composables/useTodayQueue'

const NOW = new Date('2026-07-06T12:00:00.000Z')

function makeVisitor(partial: Partial<Visitor> & { id: string }): Visitor {
  return {
    nome: 'Visitante',
    telefone: null,
    idade: null,
    dataPrimeiraVisita: '2026-07-01',
    comoConheceu: null,
    observacoes: null,
    status: 'contatado',
    pgId: null,
    padrinhoId: null,
    cadastradoPor: null,
    proximoContatoEm: null,
    ultimoContatoEm: null,
    amizadeConfirmada: false,
    responsabilidade: null,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...partial
  }
}

function hoursFromNow(hours: number): string {
  return new Date(NOW.getTime() + hours * 60 * 60 * 1000).toISOString()
}

describe('useTodayQueue', () => {
  it('orders overdue first, then due-soon, then on-track, then no SLA', () => {
    const visitors = ref<Visitor[]>([
      makeVisitor({ id: 'on-track', proximoContatoEm: hoursFromNow(48) }),
      makeVisitor({ id: 'no-sla', proximoContatoEm: null }),
      makeVisitor({ id: 'overdue', proximoContatoEm: hoursFromNow(-3) }),
      makeVisitor({ id: 'due-soon', proximoContatoEm: hoursFromNow(5) })
    ])

    const { actions } = useTodayQueue({
      visitors,
      pgNameById: ref({}),
      padrinhoNameById: ref({}),
      now: ref(NOW)
    })

    expect(actions.value.map((a) => a.visitor.id)).toEqual([
      'overdue',
      'due-soon',
      'on-track',
      'no-sla'
    ])
  })

  it('resolves pg and padrinho names from the lookup maps', () => {
    const visitors = ref<Visitor[]>([
      makeVisitor({ id: 'v1', pgId: 'pg1', padrinhoId: 'p1' })
    ])

    const { actions } = useTodayQueue({
      visitors,
      pgNameById: ref({ pg1: 'PG Central' }),
      padrinhoNameById: ref({ p1: 'Ana' }),
      now: ref(NOW)
    })

    expect(actions.value[0].pgNome).toBe('PG Central')
    expect(actions.value[0].padrinhoNome).toBe('Ana')
  })

  it('counts overdue and due-soon actions', () => {
    const visitors = ref<Visitor[]>([
      makeVisitor({ id: 'a', proximoContatoEm: hoursFromNow(-1) }),
      makeVisitor({ id: 'b', proximoContatoEm: hoursFromNow(-2) }),
      makeVisitor({ id: 'c', proximoContatoEm: hoursFromNow(3) })
    ])

    const { overdueCount, dueSoonCount } = useTodayQueue({
      visitors,
      pgNameById: ref({}),
      padrinhoNameById: ref({}),
      now: ref(NOW)
    })

    expect(overdueCount.value).toBe(2)
    expect(dueSoonCount.value).toBe(1)
  })
})
