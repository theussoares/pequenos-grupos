/**
 * Autenticação via Supabase. Responsabilidade única: sessão do usuário.
 */
import { mapAuthError, type AuthErrorKey } from '~/camadas/core/utils/auth-error'

/** Papéis que podem ser escolhidos no cadastro — admin só por SQL. */
export const SIGNUP_ROLES = ['recepcionista', 'lider', 'padrinho'] as const

export type SignupRole = (typeof SIGNUP_ROLES)[number]

export interface SignUpResult {
  ok: boolean
  needsConfirmation: boolean
}

/**
 * Por proteção contra enumeração de e-mail, o Supabase responde ao signUp de um
 * e-mail já cadastrado sem erro — mas devolve `identities: []`. Sem checar isso,
 * uma segunda tentativa (ex.: escolhendo outro papel) parece funcionar mas não
 * cria nem atualiza nada.
 */
export function isAlreadyRegistered(
  user: { identities?: unknown[] | null } | null
): boolean {
  const identities = user?.identities
  return Array.isArray(identities) && identities.length === 0
}

export function useAuth() {
  const supabase = useSupabaseClient()
  const isSubmitting = ref(false)
  const error = ref<AuthErrorKey | null>(null)

  /** Loga o erro técnico original no console (diagnóstico) sem expor na UI. */
  function logAuthError(context: string, raw: unknown): void {
    console.error(`[auth:${context}]`, raw)
  }

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
        logAuthError('signIn', signInError)
        error.value = mapAuthError(signInError)
        return false
      }
      return true
    } catch (caught) {
      logAuthError('signIn', caught)
      error.value = 'generic'
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
        logAuthError('signUp', signUpError)
        error.value = mapAuthError(signUpError)
        return { ok: false, needsConfirmation: false }
      }
      if (isAlreadyRegistered(data.user)) {
        logAuthError('signUp', 'email already registered (empty identities)')
        error.value = 'emailExists'
        return { ok: false, needsConfirmation: false }
      }
      return { ok: true, needsConfirmation: data.session === null }
    } catch (caught) {
      logAuthError('signUp', caught)
      error.value = 'generic'
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
