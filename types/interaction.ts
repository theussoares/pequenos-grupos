import type { InteractionType } from '~/camadas/visitantes/domain/interaction-type'
import type { VisitorStatus } from '~/camadas/visitantes/domain/visitor-status'

export interface Interaction {
  id: string
  visitanteId: string
  autorId: string | null
  autorNome: string | null
  tipo: InteractionType
  descricao: string | null
  statusAnterior: VisitorStatus | null
  statusNovo: VisitorStatus | null
  createdAt: string
}
