/**
 * Schema de validação do cadastro de visitante na recepção (§2.6). Zod — a
 * validação vive fora do componente (usada pelo composable de registro).
 */
import { z } from 'zod'
import { digitsOnly, isCompletePhone } from '~/camadas/visitantes/domain/phone-mask'

export const visitorRegistrationSchema = z.object({
  nome: z.string().trim().min(1),
  telefone: z
    .string()
    .trim()
    .refine(isCompletePhone, 'invalid_phone')
    .transform(digitsOnly)
    .optional(),
  idade: z.number().int().positive().max(99).optional(),
  bairro: z.string().trim().min(1).optional(),
  pontoReferencia: z.string().trim().min(1).optional()
})

export type VisitorRegistrationInput = z.infer<typeof visitorRegistrationSchema>
