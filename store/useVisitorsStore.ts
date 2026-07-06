import { defineStore } from 'pinia'
import type { Visitor } from '~/types/visitor'
import type { Interaction } from '~/types/interaction'
import type { Pg } from '~/types/pg'
import type { Profile } from '~/types/profile'

interface VisitorsState {
  queue: Visitor[]
  activeVisitor: Visitor | null
  timeline: Interaction[]
  pgs: Pg[]
  padrinhos: Profile[]
  isLoading: boolean
  error: string | null
}

/**
 * Estado do funil. Apenas estado + getters derivados + mutações síncronas; a
 * orquestração assíncrona (I/O) vive nos composables, que rodam em contexto de
 * setup e escrevem aqui.
 */
export const useVisitorsStore = defineStore('visitors', {
  state: (): VisitorsState => ({
    queue: [],
    activeVisitor: null,
    timeline: [],
    pgs: [],
    padrinhos: [],
    isLoading: false,
    error: null
  }),

  getters: {
    pgNameById: (state): Record<string, string> =>
      Object.fromEntries(state.pgs.map((pg) => [pg.id, pg.nome])),

    padrinhoNameById: (state): Record<string, string> =>
      Object.fromEntries(state.padrinhos.map((p) => [p.id, p.nome])),

    openCount: (state): number => state.queue.length
  },

  actions: {
    setLoading(value: boolean) {
      this.isLoading = value
    },

    setError(message: string | null) {
      this.error = message
    },

    setQueue(visitors: Visitor[]) {
      this.queue = visitors
    },

    setLookups(pgs: Pg[], padrinhos: Profile[]) {
      this.pgs = pgs
      this.padrinhos = padrinhos
    },

    setActiveVisitor(visitor: Visitor | null) {
      this.activeVisitor = visitor
    },

    setTimeline(interactions: Interaction[]) {
      this.timeline = interactions
    },

    prependInteraction(interaction: Interaction) {
      this.timeline = [interaction, ...this.timeline]
    },

    upsertVisitor(visitor: Visitor) {
      if (this.activeVisitor?.id === visitor.id) {
        this.activeVisitor = visitor
      }
      const index = this.queue.findIndex((v) => v.id === visitor.id)
      if (index === -1) return
      this.queue[index] = visitor
    }
  }
})
