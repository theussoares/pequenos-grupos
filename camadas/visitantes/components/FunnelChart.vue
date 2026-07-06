<script setup lang="ts">
import type { FunnelStageCount } from '~/camadas/visitantes/domain/metrics'

const props = defineProps<{ funnel: FunnelStageCount }>()

const { t } = useI18n()

interface FunnelRow {
  key: string
  label: string
  count: number
  width: number
}

const rows = computed<FunnelRow[]>(() => {
  const base = props.funnel.novos || 1
  const stages: { key: string; count: number }[] = [
    { key: 'novos', count: props.funnel.novos },
    { key: 'contatados', count: props.funnel.contatados },
    { key: 'noPG', count: props.funnel.noPG },
    { key: 'emVinculo', count: props.funnel.emVinculo }
  ]
  return stages.map((stage) => ({
    key: stage.key,
    label: t(`metrics.stage.${stage.key}`),
    count: stage.count,
    width: Math.round((stage.count / base) * 100)
  }))
})
</script>

<template>
  <BaseCard>
    <h2 class="mb-3 text-sm font-semibold text-text">
      {{ t('metrics.funnelTitle') }}
    </h2>
    <div class="space-y-2">
      <div v-for="row in rows" :key="row.key">
        <div class="mb-1 flex items-center justify-between text-sm">
          <span class="text-text">{{ row.label }}</span>
          <span class="font-medium text-text-muted">{{ row.count }}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            class="h-full rounded-full bg-primary transition-all"
            :style="{ width: `${row.width}%` }"
          />
        </div>
      </div>
    </div>
  </BaseCard>
</template>
