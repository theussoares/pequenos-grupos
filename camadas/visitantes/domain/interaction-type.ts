/**
 * Tipos de interação registrados na timeline do visitante (§2.3 do PDF).
 * Domínio puro.
 */

export const INTERACTION_TYPES = [
  'mensagem',
  'ligacao',
  'presenca_pg',
  'presenca_culto',
  'visita',
  'mudanca_status',
  'nota'
] as const

export type InteractionType = (typeof INTERACTION_TYPES)[number]

/** Ações rápidas expostas na UI (subconjunto registrável manualmente). */
export const QUICK_INTERACTION_TYPES = [
  'mensagem',
  'ligacao',
  'presenca_culto',
  'visita',
  'nota'
] as const satisfies readonly InteractionType[]

export function isInteractionType(value: string): value is InteractionType {
  return (INTERACTION_TYPES as readonly string[]).includes(value)
}
