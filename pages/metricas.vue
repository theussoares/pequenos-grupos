<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { formatPercent } from '~/camadas/core/utils/format'

const { t, locale } = useI18n()
const store = useVisitorsStore()
const { error, isAdmin } = storeToRefs(store)

const { loadProfile } = useCurrentProfile()
const { loadMetrics } = useMetricsData()

const now = ref(new Date())
const ready = ref(false)
const { metrics } = useMetrics(now)

onMounted(async () => {
  await loadProfile()
  if (!isAdmin.value) {
    await navigateTo('/hoje')
    return
  }
  await loadMetrics()
  ready.value = true
})

function pct(ratio: number | null): string {
  return formatPercent(ratio, locale.value)
}
</script>

<template>
  <section>
    <header class="mb-4">
      <h1 class="text-xl font-semibold text-text">{{ t('metrics.title') }}</h1>
      <p class="text-sm text-text-muted">{{ t('metrics.subtitle') }}</p>
    </header>

    <AppSpinner v-if="!ready && !error" :label="t('common.loading')" />

    <div v-else-if="error" class="text-center">
      <p class="text-sm text-danger">{{ error }}</p>
      <BaseButton class="mt-3" variant="ghost" size="sm" @click="loadMetrics">
        {{ t('common.retry') }}
      </BaseButton>
    </div>

    <div v-else class="space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <MetricStat
          :label="t('metrics.contactRate')"
          :value="pct(metrics.conversion.contato)"
          :hint="t('metrics.goal.contact')"
        />
        <MetricStat
          :label="t('metrics.pgConversion')"
          :value="pct(metrics.conversion.pgOfCohort)"
          :hint="t('metrics.goal.pg')"
        />
        <MetricStat
          :label="t('metrics.retention30')"
          :value="pct(metrics.retention30)"
          :hint="t('metrics.goal.ret30')"
        />
        <MetricStat
          :label="t('metrics.retention90')"
          :value="pct(metrics.retention90)"
          :hint="t('metrics.goal.ret90')"
        />
        <MetricStat
          :label="t('metrics.vinculo')"
          :value="pct(metrics.vinculoRate)"
          :hint="t('metrics.goal.vinculo')"
        />
        <MetricStat
          :label="t('metrics.cohort')"
          :value="String(metrics.monthCohortSize)"
        />
      </div>

      <FunnelChart :funnel="metrics.funnel" />
      <TrendChart :points="metrics.monthlyTrend" />
      <OverdueList :entries="metrics.overdue" />
    </div>
  </section>
</template>
