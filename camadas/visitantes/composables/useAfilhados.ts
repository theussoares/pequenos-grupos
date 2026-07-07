/**
 * Orquestra o carregamento dos afilhados do padrinho autenticado + lookups de
 * PG. Responsabilidade única: carregar os afilhados para a store.
 */
import { toErrorMessage } from '~/camadas/core/utils/error'

export function useAfilhados() {
  const store = useVisitorsStore()
  const repository = useVisitorsRepository()
  const currentUserId = useCurrentUserId()

  async function loadAfilhados(): Promise<void> {
    if (!currentUserId.value) return
    store.setLoading(true)
    store.setError(null)
    try {
      const [afilhados, pgs] = await Promise.all([
        repository.fetchAfilhados(currentUserId.value),
        repository.fetchPgs()
      ])
      store.setAfilhados(afilhados)
      store.setLookups(pgs, store.padrinhos)
    } catch (error) {
      store.setError(toErrorMessage(error))
    } finally {
      store.setLoading(false)
    }
  }

  return { loadAfilhados }
}
