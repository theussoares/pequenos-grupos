import type { VisitorStatus } from '~/camadas/visitantes/domain/visitor-status'
import type { SlaUrgency } from '~/camadas/visitantes/domain/sla'

export interface Visitor {
  id: string
  nome: string
  telefone: string | null
  idade: number | null
  dataPrimeiraVisita: string
  comoConheceu: string | null
  observacoes: string | null
  status: VisitorStatus
  pgId: string | null
  padrinhoId: string | null
  cadastradoPor: string | null
  proximoContatoEm: string | null
  ultimoContatoEm: string | null
  amizadeConfirmada: boolean
  responsabilidade: string | null
  statusChangedAt: string
  createdAt: string
  updatedAt: string
}

/** Item da fila "Hoje": visitante enriquecido com a urgência de SLA derivada. */
export interface TodayAction {
  visitor: Visitor
  padrinhoNome: string | null
  pgNome: string | null
  deadline: Date | null
  urgency: SlaUrgency
}

/** Card do Kanban: visitante + métricas derivadas para exibição na coluna. */
export interface BoardCard {
  visitor: Visitor
  padrinhoNome: string | null
  daysInStatus: number
  isOverdue: boolean
}

/** Resumo de um visitante cadastrado nesta sessão de recepção (feedback local). */
export interface RegisteredVisitorSummary {
  nome: string
  telefone: string | null
  comoConheceu: string | null
  registeredAt: string
}
