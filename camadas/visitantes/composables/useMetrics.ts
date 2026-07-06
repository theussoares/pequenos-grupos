/**
 * Deriva as métricas do funil a partir dos visitantes na store. Responsabilidade
 * única: transformação reativa via domínio puro — sem I/O.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  computeFunnelMetrics,
  type FunnelMetrics
} from '~/camadas/visitantes/domain/metrics'

export function useMetrics(now: Ref<Date>): {
  metrics: ComputedRef<FunnelMetrics>
} {
  const store = useVisitorsStore()
  const { metricsVisitors } = storeToRefs(store)

  const metrics = computed(() =>
    computeFunnelMetrics(metricsVisitors.value, now.value)
  )

  return { metrics }
}
