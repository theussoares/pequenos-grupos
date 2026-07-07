<script setup lang="ts">
import type { MonthlyPoint } from '~/camadas/visitantes/domain/metrics'
import { formatMonthKey } from '~/camadas/core/utils/format'

const props = defineProps<{ points: MonthlyPoint[] }>()

const { t, locale } = useI18n()

const BAR_AREA_PX = 96

const maxCount = computed(() =>
  Math.max(1, ...props.points.map((point) => point.count))
)

function barHeightPx(count: number): number {
  if (count === 0) return 2
  return Math.max(6, Math.round((count / maxCount.value) * BAR_AREA_PX))
}
</script>

<template>
  <BaseCard>
    <h2 class="mb-3 text-sm font-semibold text-text">
      {{ t('metrics.trendTitle') }}
    </h2>
    <div class="flex items-end gap-2">
      <div
        v-for="point in points"
        :key="point.month"
        class="flex flex-1 flex-col items-center justify-end gap-1"
      >
        <span class="text-xs font-medium text-text-muted">{{ point.count }}</span>
        <div
          class="w-full rounded-t-md bg-primary/70"
          :style="{ height: `${barHeightPx(point.count)}px` }"
        />
        <span class="text-xs capitalize text-text-muted">
          {{ formatMonthKey(point.month, locale) }}
        </span>
      </div>
    </div>
  </BaseCard>
</template>
