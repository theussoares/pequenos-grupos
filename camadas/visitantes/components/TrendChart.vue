<script setup lang="ts">
import type { MonthlyPoint } from '~/camadas/visitantes/domain/metrics'
import { formatMonthKey } from '~/camadas/core/utils/format'

const props = defineProps<{ points: MonthlyPoint[] }>()

const { t, locale } = useI18n()

const maxCount = computed(() =>
  Math.max(1, ...props.points.map((point) => point.count))
)

function heightPercent(count: number): number {
  return Math.round((count / maxCount.value) * 100)
}
</script>

<template>
  <BaseCard>
    <h2 class="mb-3 text-sm font-semibold text-text">
      {{ t('metrics.trendTitle') }}
    </h2>
    <div class="flex items-end gap-2" style="height: 8rem">
      <div
        v-for="point in points"
        :key="point.month"
        class="flex flex-1 flex-col items-center gap-1"
      >
        <span class="text-xs font-medium text-text-muted">{{ point.count }}</span>
        <div class="flex w-full flex-1 items-end">
          <div
            class="w-full rounded-t-md bg-primary/70"
            :style="{ height: `${heightPercent(point.count)}%` }"
          />
        </div>
        <span class="text-xs capitalize text-text-muted">
          {{ formatMonthKey(point.month, locale) }}
        </span>
      </div>
    </div>
  </BaseCard>
</template>
