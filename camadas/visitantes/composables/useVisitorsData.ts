/**
 * Orquestra o carregamento da fila "Hoje" (visitantes abertos + lookups de PG e
 * padrinhos) para dentro da store. Responsabilidade única: carregar dados de
 * lista. Sem transformação de urgência (isso é do useTodayQueue).
 */
import { toErrorMessage } from '~/camadas/core/utils/error'

export function useVisitorsData() {
  const store = useVisitorsStore()
  const repository = useVisitorsRepository()

  async function loadQueue(): Promise<void> {
    store.setLoading(true)
    store.setError(null)
    try {
      const [queue, pgs, padrinhos] = await Promise.all([
        repository.fetchQueue(),
        repository.fetchPgs(),
        repository.fetchPotentialPadrinhos()
      ])
      store.setQueue(queue)
      store.setLookups(pgs, padrinhos)
    } catch (error) {
      store.setError(toErrorMessage(error))
    } finally {
      store.setLoading(false)
    }
  }

  return { loadQueue }
}
