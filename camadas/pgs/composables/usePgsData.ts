/**
 * Orquestra o carregamento da tela de gestão de PGs (todos os PGs + candidatos
 * a líder). Responsabilidade única: carregar dados.
 */
import { toErrorMessage } from '~/camadas/core/utils/error'

export function usePgsData() {
  const store = usePgsStore()
  const repository = usePgsRepository()

  async function loadPgs(): Promise<void> {
    store.setLoading(true)
    store.setError(null)
    try {
      const [pgs, leaderCandidates] = await Promise.all([
        repository.fetchAll(),
        repository.fetchLeaderCandidates()
      ])
      store.setPgs(pgs)
      store.setLeaderCandidates(leaderCandidates)
    } catch (error) {
      store.setError(toErrorMessage(error))
    } finally {
      store.setLoading(false)
    }
  }

  return { loadPgs }
}
