/**
 * Carrega o perfil (papel + PG) do usuário autenticado para a store, habilitando
 * o gating de navegação/UI por papel. Responsabilidade única: perfil atual.
 */
import { toErrorMessage } from '~/camadas/core/utils/error'

export function useCurrentProfile() {
  const store = useVisitorsStore()
  const repository = useVisitorsRepository()
  const currentUserId = useCurrentUserId()

  async function loadProfile(): Promise<void> {
    if (!currentUserId.value) return
    try {
      store.setCurrentProfile(
        await repository.fetchCurrentProfile(currentUserId.value)
      )
    } catch (error) {
      store.setError(toErrorMessage(error))
    }
  }

  return { loadProfile }
}
