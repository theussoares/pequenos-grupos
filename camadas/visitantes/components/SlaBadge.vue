<script setup lang="ts">
import type { SlaUrgency } from '~/camadas/visitantes/domain/sla'
import { formatRelativeToNow } from '~/camadas/core/utils/date'

type Tone = 'neutral' | 'warning' | 'danger'

const props = defineProps<{
  urgency: SlaUrgency
  deadline: Date | null
  now: Date
}>()

const { t, locale } = useI18n()

const TONE_BY_URGENCY: Record<Exclude<SlaUrgency, 'none'>, Tone> = {
  overdue: 'danger',
  'due-soon': 'warning',
  'on-track': 'neutral'
}

const relative = computed(() =>
  formatRelativeToNow(props.deadline, props.now, locale.value)
)

const label = computed(() => {
  if (props.urgency === 'overdue') return t('sla.overdue')
  if (props.urgency === 'due-soon') return t('sla.dueSoon', { when: relative.value })
  return relative.value
})
</script>

<template>
  <BaseBadge
    v-if="urgency !== 'none'"
    :tone="TONE_BY_URGENCY[urgency]"
  >
    <Icon name="lucide:clock" />
    {{ label }}
  </BaseBadge>
</template>
