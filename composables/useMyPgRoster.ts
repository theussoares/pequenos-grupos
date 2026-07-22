/**
 * Orquestra o carregamento do PG do líder logado: informações do grupo,
 * visitantes do PG e candidatos a padrinho. Responsabilidade única: carregar
 * dados para a tela "Meu PG". Estado local (não é dado compartilhado entre
 * páginas, então não precisa de store dedicada).
 */
import { ref } from 'vue'
import type { Pg } from '~/types/pg'
import type { Visitor } from '~/types/visitor'
import type { Profile } from '~/types/profile'
import { toErrorMessage } from '~/camadas/core/utils/error'

export function useMyPgRoster() {
  const visitorsStore = useVisitorsStore()
  const pgsRepository = usePgsRepository()
  const visitorsRepository = useVisitorsRepository()

  const pg = ref<Pg | null>(null)
  const visitors = ref<Visitor[]>([])
  const padrinhoOptions = ref<Profile[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load(): Promise<void> {
    const pgId = visitorsStore.currentProfile?.pgId
    if (!pgId) return

    isLoading.value = true
    error.value = null
    try {
      const [pgInfo, myVisitors, padrinhos] = await Promise.all([
        pgsRepository.fetchOne(pgId),
        visitorsRepository.fetchByPg(pgId),
        visitorsRepository.fetchPotentialPadrinhos()
      ])
      pg.value = pgInfo
      visitors.value = myVisitors
      padrinhoOptions.value = padrinhos
    } catch (caught) {
      error.value = toErrorMessage(caught)
    } finally {
      isLoading.value = false
    }
  }

  return { pg, visitors, padrinhoOptions, isLoading, error, load }
}
