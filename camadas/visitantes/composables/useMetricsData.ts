/**
 * Orquestra o carregamento dos dados de métricas (todos os visitantes, admin).
 * Responsabilidade única: carregar; a agregação é do domínio (useMetrics).
 */
import { toErrorMessage } from '~/camadas/core/utils/error'

export function useMetricsData() {
  const store = useVisitorsStore()
  const repository = useVisitorsRepository()

  async function loadMetrics(): Promise<void> {
    store.setLoading(true)
    store.setError(null)
    try {
      store.setMetricsVisitors(await repository.fetchAllVisitors())
    } catch (error) {
      store.setError(toErrorMessage(error))
    } finally {
      store.setLoading(false)
    }
  }

  return { loadMetrics }
}
