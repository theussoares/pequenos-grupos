/**
 * Formata a timeline de interações da store em view models de apresentação
 * (ícone, título, descrição, data). Responsabilidade única: apresentação — sem
 * I/O nem mutação.
 */
import { computed, type ComputedRef } from 'vue'
import { storeToRefs } from 'pinia'
import type { Interaction } from '~/types/interaction'
import type { InteractionType } from '~/camadas/visitantes/domain/interaction-type'
import { formatDateTime } from '~/camadas/core/utils/date'

const ICON_BY_TYPE: Record<InteractionType, string> = {
  mensagem: 'lucide:message-circle',
  ligacao: 'lucide:phone',
  presenca_pg: 'lucide:users',
  presenca_culto: 'lucide:church',
  visita: 'lucide:house',
  mudanca_status: 'lucide:git-branch',
  nota: 'lucide:sticky-note'
}

export interface TimelineItem {
  id: string
  icon: string
  title: string
  description: string | null
  when: string
}

export function useVisitorTimeline(): {
  items: ComputedRef<TimelineItem[]>
} {
  const store = useVisitorsStore()
  const { timeline } = storeToRefs(store)
  const { t, locale } = useI18n()

  function titleFor(interaction: Interaction): string {
    if (interaction.tipo === 'mudanca_status') {
      return t('timeline.statusChange', {
        from: t(`visitor.status.${interaction.statusAnterior}`),
        to: t(`visitor.status.${interaction.statusNovo}`)
      })
    }
    return t(`interaction.type.${interaction.tipo}`)
  }

  const items = computed<TimelineItem[]>(() =>
    timeline.value.map((interaction) => ({
      id: interaction.id,
      icon: ICON_BY_TYPE[interaction.tipo],
      title: titleFor(interaction),
      description: interaction.descricao,
      when: formatDateTime(interaction.createdAt, locale.value)
    }))
  )

  return { items }
}
