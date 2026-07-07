/**
 * Autenticação via Supabase. Responsabilidade única: sessão do usuário.
 */
import { toErrorMessage } from '~/camadas/core/utils/error'

/** Papéis que podem ser escolhidos no cadastro — admin só por SQL. */
export const SIGNUP_ROLES = ['recepcionista', 'lider', 'padrinho'] as const

export type SignupRole = (typeof SIGNUP_ROLES)[number]

export interface SignUpResult {
  ok: boolean
  needsConfirmation: boolean
}

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

  async function signUp(
    email: string,
    password: string,
    nome: string,
    role: SignupRole
  ): Promise<SignUpResult> {
    isSubmitting.value = true
    error.value = null
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome, role } }
      })
      if (signUpError) {
        error.value = signUpError.message
        return { ok: false, needsConfirmation: false }
      }
      return { ok: true, needsConfirmation: data.session === null }
    } catch (caught) {
      error.value = toErrorMessage(caught)
      return { ok: false, needsConfirmation: false }
    } finally {
      isSubmitting.value = false
    }
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  return { isSubmitting, error, signInWithPassword, signUp, signOut }
}
