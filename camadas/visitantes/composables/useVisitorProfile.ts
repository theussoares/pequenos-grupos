/**
 * Orquestra o carregamento da tela de perfil: visitante + timeline + lookups.
 * Responsabilidade única: carregar os dados de um visitante para a store.
 */
import { toErrorMessage } from '~/camadas/core/utils/error'

export function useVisitorProfile() {
  const store = useVisitorsStore()
  const repository = useVisitorsRepository()

  async function loadVisitor(id: string): Promise<void> {
    store.setLoading(true)
    store.setError(null)
    try {
      const [visitor, timeline, pgs, padrinhos] = await Promise.all([
        repository.fetchVisitor(id),
        repository.fetchTimeline(id),
        repository.fetchPgs(),
        repository.fetchPotentialPadrinhos()
      ])
      store.setActiveVisitor(visitor)
      store.setTimeline(timeline)
      store.setLookups(pgs, padrinhos)
    } catch (error) {
      store.setError(toErrorMessage(error))
    } finally {
      store.setLoading(false)
    }
  }

  return { loadVisitor }
}
