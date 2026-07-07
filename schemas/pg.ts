/**
 * Schema de validação de criação/edição de PG. Zod — validação fora do
 * componente, usada por usePgActions.
 */
import { z } from 'zod'

export const pgSchema = z.object({
  nome: z.string().trim().min(1),
  diaSemana: z.number().int().min(0).max(6),
  horario: z.string().trim().min(1).nullable(),
  endereco: z.string().trim().min(1).nullable()
})

export type PgInput = z.infer<typeof pgSchema>
