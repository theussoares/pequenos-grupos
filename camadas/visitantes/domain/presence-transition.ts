/**
 * Regra de transição automática por presença (§2.5 do PDF): registrar presença
 * move o visitante para `presente_pg` (1ª) ou `em_vinculo` (2ª+). Domínio puro.
 */
import { canTransition, type VisitorStatus } from './visitor-status'

/**
 * Próximo status após registrar uma presença. Retorna `null` quando o status
 * atual não admite avanço por presença (evita transição inválida).
 */
export function nextStatusOnPresence(
  status: VisitorStatus
): VisitorStatus | null {
  if (canTransition(status, 'presente_pg')) return 'presente_pg'
  if (canTransition(status, 'em_vinculo')) return 'em_vinculo'
  return null
}
