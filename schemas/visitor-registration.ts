/**
 * Schema de validação do cadastro de visitante na recepção (§2.6). Zod — a
 * validação vive fora do componente (usada pelo composable de registro).
 */
import { z } from 'zod'

export const visitorRegistrationSchema = z.object({
  nome: z.string().trim().min(1),
  telefone: z.string().trim().min(1).optional(),
  idade: z.number().int().positive().max(120).optional(),
  comoConheceu: z.string().trim().min(1).optional()
})

export type VisitorRegistrationInput = z.infer<typeof visitorRegistrationSchema>
