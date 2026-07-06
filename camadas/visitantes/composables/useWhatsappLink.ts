/**
 * Monta o link de WhatsApp de um visitante com o template i18n correspondente ao
 * seu status. Responsabilidade única: resolver template + delegar ao domínio.
 */
import type { Visitor } from '~/types/visitor'
import { buildWhatsappUrl } from '~/camadas/visitantes/domain/whatsapp'
import {
  firstName,
  whatsappTemplateKey
} from '~/camadas/visitantes/domain/whatsapp-template'

export function useWhatsappLink() {
  const { t } = useI18n()

  function linkFor(visitor: Visitor): string | null {
    const message = t(whatsappTemplateKey(visitor.status), {
      name: firstName(visitor.nome)
    })
    return buildWhatsappUrl(visitor.telefone, message)
  }

  return { linkFor }
}
