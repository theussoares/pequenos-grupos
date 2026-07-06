import { defineStore } from 'pinia'
import type { Visitor } from '~/types/visitor'
import type { Interaction } from '~/types/interaction'
import type { Pg } from '~/types/pg'
import type { Profile } from '~/types/profile'

interface VisitorsState {
  queue: Visitor[]
  board: Visitor[]
  afilhados: Visitor[]
  metricsVisitors: Visitor[]
  activeVisitor: Visitor | null
  timeline: Interaction[]
  pgs: Pg[]
  padrinhos: Profile[]
  currentProfile: Profile | null
  isLoading: boolean
  error: string | null
}

/** Substitui um visitante numa lista, quando presente. Mantém referência nova. */
function replaceIn(list: Visitor[], visitor: Visitor): Visitor[] {
  const index = list.findIndex((v) => v.id === visitor.id)
  if (index === -1) return list
  const next = list.slice()
  next[index] = visitor
  return next
}

/**
 * Estado do funil. Apenas estado + getters derivados + mutações síncronas; a
 * orquestração assíncrona (I/O) vive nos composables, que rodam em contexto de
 * setup e escrevem aqui.
 */
export const useVisitorsStore = defineStore('visitors', {
  state: (): VisitorsState => ({
    queue: [],
    board: [],
    afilhados: [],
    metricsVisitors: [],
    activeVisitor: null,
    timeline: [],
    pgs: [],
    padrinhos: [],
    currentProfile: null,
    isLoading: false,
    error: null
  }),

  getters: {
    pgNameById: (state): Record<string, string> =>
      Object.fromEntries(state.pgs.map((pg) => [pg.id, pg.nome])),

    padrinhoNameById: (state): Record<string, string> =>
      Object.fromEntries(state.padrinhos.map((p) => [p.id, p.nome])),

    openCount: (state): number => state.queue.length,

    isAdmin: (state): boolean => state.currentProfile?.role === 'admin',
    isLider: (state): boolean => state.currentProfile?.role === 'lider',
    isPadrinho: (state): boolean => state.currentProfile?.role === 'padrinho',
    isRecepcionista: (state): boolean =>
      state.currentProfile?.role === 'recepcionista'
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

    setBoard(visitors: Visitor[]) {
      this.board = visitors
    },

    setAfilhados(visitors: Visitor[]) {
      this.afilhados = visitors
    },

    setMetricsVisitors(visitors: Visitor[]) {
      this.metricsVisitors = visitors
    },

    setLookups(pgs: Pg[], padrinhos: Profile[]) {
      this.pgs = pgs
      this.padrinhos = padrinhos
    },

    setCurrentProfile(profile: Profile | null) {
      this.currentProfile = profile
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
      this.queue = replaceIn(this.queue, visitor)
      this.board = replaceIn(this.board, visitor)
      this.afilhados = replaceIn(this.afilhados, visitor)
    }
  }
})
