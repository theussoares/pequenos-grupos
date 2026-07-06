<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { TodayAction } from '~/types/visitor'

const { t } = useI18n()
const store = useVisitorsStore()
const { queue, pgNameById, padrinhoNameById, isLoading, error } =
  storeToRefs(store)

const { loadQueue } = useVisitorsData()
const { linkFor } = useWhatsappLink()
const { registerInteraction } = useVisitorActions()

const now = ref(new Date())
const busyId = ref<string | null>(null)

const { actions, overdueCount, dueSoonCount } = useTodayQueue({
  visitors: queue,
  pgNameById,
  padrinhoNameById,
  now
})

onMounted(loadQueue)

async function onContacted(action: TodayAction) {
  busyId.value = action.visitor.id
  await registerInteraction(action.visitor, 'mensagem')
  busyId.value = null
}
</script>

<template>
  <section>
    <header class="mb-4">
      <h1 class="text-xl font-semibold text-text">{{ t('today.title') }}</h1>
      <p class="text-sm text-text-muted">{{ t('today.subtitle') }}</p>
      <div v-if="actions.length" class="mt-2 flex gap-2">
        <BaseBadge v-if="overdueCount" tone="danger">
          {{ t('today.overdue', { count: overdueCount }) }}
        </BaseBadge>
        <BaseBadge v-if="dueSoonCount" tone="warning">
          {{ t('today.dueSoon', { count: dueSoonCount }) }}
        </BaseBadge>
      </div>
    </header>

    <AppSpinner v-if="isLoading" :label="t('common.loading')" />

    <div v-else-if="error" class="text-center">
      <p class="text-sm text-danger">{{ error }}</p>
      <BaseButton class="mt-3" variant="ghost" size="sm" @click="loadQueue">
        {{ t('common.retry') }}
      </BaseButton>
    </div>

    <EmptyState
      v-else-if="!actions.length"
      icon="lucide:party-popper"
      :title="t('today.empty')"
      :description="t('today.emptyDescription')"
    />

    <div v-else class="space-y-3">
      <TodayActionCard
        v-for="action in actions"
        :key="action.visitor.id"
        :action="action"
        :now="now"
        :whatsapp-url="linkFor(action.visitor)"
        :busy="busyId === action.visitor.id"
        @contacted="onContacted(action)"
      />
    </div>
  </section>
</template>
