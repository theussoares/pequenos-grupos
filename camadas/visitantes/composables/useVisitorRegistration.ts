/**
 * Cadastro de visitante na recepção. Responsabilidade única: validar a entrada,
 * calcular o SLA inicial e persistir; mantém uma fila local dos cadastrados
 * nesta sessão como feedback (a recepcionista não tem SELECT nos visitantes).
 */
import { ref } from 'vue'
import type { RegisteredVisitorSummary } from '~/types/visitor'
import {
  visitorRegistrationSchema,
  type VisitorRegistrationInput
} from '~/schemas/visitor-registration'
import { computeNextContactDeadline } from '~/camadas/visitantes/domain/sla'
import { toErrorMessage } from '~/camadas/core/utils/error'

export function useVisitorRegistration() {
  const repository = useVisitorsRepository()
  const user = useSupabaseUser()

  const isSubmitting = ref(false)
  const error = ref<string | null>(null)
  const recentlyAdded = ref<RegisteredVisitorSummary[]>([])

  async function register(input: VisitorRegistrationInput): Promise<boolean> {
    error.value = null
    const parsed = visitorRegistrationSchema.safeParse(input)
    if (!parsed.success) {
      error.value = 'validation'
      return false
    }

    isSubmitting.value = true
    try {
      const now = new Date()
      const deadline = computeNextContactDeadline({
        status: 'novo',
        enteredAt: now,
        firstVisitDate: now
      })
      await repository.insertVisitor({
        nome: parsed.data.nome,
        telefone: parsed.data.telefone ?? null,
        idade: parsed.data.idade ?? null,
        como_conheceu: parsed.data.comoConheceu ?? null,
        status: 'novo',
        cadastrado_por: user.value?.id ?? null,
        proximo_contato_em: deadline ? deadline.toISOString() : null
      })
      recentlyAdded.value = [
        {
          nome: parsed.data.nome,
          telefone: parsed.data.telefone ?? null,
          comoConheceu: parsed.data.comoConheceu ?? null,
          registeredAt: now.toISOString()
        },
        ...recentlyAdded.value
      ]
      return true
    } catch (caught) {
      error.value = toErrorMessage(caught)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return { register, isSubmitting, error, recentlyAdded }
}
