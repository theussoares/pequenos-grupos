/**
 * Autenticação via Supabase. Responsabilidade única: sessão do usuário.
 */
import { toErrorMessage } from '~/camadas/core/utils/error'

export function useAuth() {
  const supabase = useSupabaseClient()
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  async function signInWithPassword(
    email: string,
    password: string
  ): Promise<boolean> {
    isSubmitting.value = true
    error.value = null
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (signInError) {
        error.value = signInError.message
        return false
      }
      return true
    } catch (caught) {
      error.value = toErrorMessage(caught)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  return { isSubmitting, error, signInWithPassword, signOut }
}
