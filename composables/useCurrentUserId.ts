/**
 * ID do usuário autenticado. O useSupabaseUser (módulo v2) devolve o payload do
 * JWT — o identificador vive em `sub`, não em `id`. Centralizamos aqui para
 * nenhum consumidor depender do formato do payload.
 */
import { computed, type ComputedRef } from 'vue'

export function useCurrentUserId(): ComputedRef<string | null> {
  const user = useSupabaseUser()
  return computed(() => user.value?.sub ?? null)
}
