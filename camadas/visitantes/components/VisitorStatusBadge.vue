<script setup lang="ts">
import type { VisitorStatus } from '~/camadas/visitantes/domain/visitor-status'

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

const props = defineProps<{ status: VisitorStatus }>()

const { t } = useI18n()

const TONE_BY_STATUS: Record<VisitorStatus, Tone> = {
  novo: 'neutral',
  contatado: 'primary',
  convidado: 'primary',
  presente_pg: 'success',
  em_vinculo: 'success',
  integrado: 'success',
  sem_resposta: 'warning',
  reativacao: 'warning',
  arquivado: 'neutral'
}

const tone = computed(() => TONE_BY_STATUS[props.status])
const label = computed(() => t(`visitor.status.${props.status}`))
</script>

<template>
  <BaseBadge :tone="tone">{{ label }}</BaseBadge>
</template>
