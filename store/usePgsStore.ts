import { defineStore } from 'pinia'
import type { Pg } from '~/types/pg'
import type { Profile } from '~/types/profile'

interface PgsState {
  pgs: Pg[]
  leaderCandidates: Profile[]
  isLoading: boolean
  error: string | null
}

/**
 * Estado da gestão de PGs (tela /pgs). Separado do useVisitorsStore: aquele
 * mantém apenas um cache de PGs ativos para lookups do funil; este é o dataset
 * completo (ativos e inativos) usado na tela de gestão.
 */
export const usePgsStore = defineStore('pgs', {
  state: (): PgsState => ({
    pgs: [],
    leaderCandidates: [],
    isLoading: false,
    error: null
  }),

  getters: {
    activePgs: (state): Pg[] => state.pgs.filter((pg) => pg.ativo),
    inactivePgs: (state): Pg[] => state.pgs.filter((pg) => !pg.ativo)
  },

  actions: {
    setLoading(value: boolean) {
      this.isLoading = value
    },

    setError(message: string | null) {
      this.error = message
    },

    setPgs(pgs: Pg[]) {
      this.pgs = pgs
    },

    setLeaderCandidates(profiles: Profile[]) {
      this.leaderCandidates = profiles
    },

    upsertPg(pg: Pg) {
      const index = this.pgs.findIndex((p) => p.id === pg.id)
      if (index === -1) {
        this.pgs = [...this.pgs, pg]
        return
      }
      const next = this.pgs.slice()
      next[index] = pg
      this.pgs = next
    }
  }
})
