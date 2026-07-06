/**
 * Orquestra o carregamento do Kanban do funil (visitantes não arquivados +
 * lookups). Responsabilidade única: carregar dados do board.
 */
import { toErrorMessage } from '~/camadas/core/utils/error'

export function useBoardData() {
  const store = useVisitorsStore()
  const repository = useVisitorsRepository()

  async function loadBoard(): Promise<void> {
    store.setLoading(true)
    store.setError(null)
    try {
      const [board, pgs, padrinhos] = await Promise.all([
        repository.fetchBoard(),
        repository.fetchPgs(),
        repository.fetchPotentialPadrinhos()
      ])
      store.setBoard(board)
      store.setLookups(pgs, padrinhos)
    } catch (error) {
      store.setError(toErrorMessage(error))
    } finally {
      store.setLoading(false)
    }
  }

  return { loadBoard }
}
