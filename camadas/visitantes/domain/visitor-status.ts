/**
 * Máquina de estados do visitante (§2.2 do PDF). Domínio puro: sem Vue, Nuxt
 * ou Supabase. Autoridade única das transições válidas do funil.
 */

export const VISITOR_STATUSES = [
  'novo',
  'contatado',
  'convidado',
  'presente_pg',
  'em_vinculo',
  'integrado',
  'sem_resposta',
  'reativacao',
  'arquivado'
] as const

export type VisitorStatus = (typeof VISITOR_STATUSES)[number]

const STATUS_TRANSITIONS: Record<VisitorStatus, readonly VisitorStatus[]> = {
  novo: ['contatado', 'arquivado'],
  contatado: ['convidado', 'arquivado'],
  convidado: ['presente_pg', 'sem_resposta'],
  presente_pg: ['em_vinculo', 'sem_resposta'],
  em_vinculo: ['integrado', 'sem_resposta'],
  integrado: [],
  sem_resposta: ['reativacao', 'arquivado'],
  reativacao: ['contatado', 'arquivado'],
  arquivado: ['reativacao']
}

export function allowedTransitions(from: VisitorStatus): readonly VisitorStatus[] {
  return STATUS_TRANSITIONS[from]
}

export function canTransition(from: VisitorStatus, to: VisitorStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to)
}

export function isFinalStatus(status: VisitorStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0
}

export function isVisitorStatus(value: string): value is VisitorStatus {
  return (VISITOR_STATUSES as readonly string[]).includes(value)
}
