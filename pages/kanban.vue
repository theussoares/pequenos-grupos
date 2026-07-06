<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Visitor } from '~/types/visitor'
import type { VisitorStatus } from '~/camadas/visitantes/domain/visitor-status'

const { t } = useI18n()
const store = useVisitorsStore()
const { board, padrinhoNameById, isLoading, error, isPadrinho } =
  storeToRefs(store)

const { loadBoard } = useBoardData()
const { loadProfile } = useCurrentProfile()
const actions = useVisitorActions()

const now = ref(new Date())
const busy = ref(false)

const { columns } = useFunnelBoard({
  visitors: board,
  padrinhoNameById,
  now
})

onMounted(async () => {
  await loadProfile()
  if (isPadrinho.value) {
    await navigateTo('/meu-afilhado')
    return
  }
  await loadBoard()
})

async function onMove(visitor: Visitor, to: VisitorStatus) {
  busy.value = true
  await actions.advanceStatus(visitor, to)
  busy.value = false
}
</script>

<template>
  <section>
    <header class="mb-4">
      <h1 class="text-xl font-semibold text-text">{{ t('kanban.title') }}</h1>
      <p class="text-sm text-text-muted">{{ t('kanban.subtitle') }}</p>
    </header>

    <AppSpinner v-if="isLoading" :label="t('common.loading')" />

    <div v-else-if="error" class="text-center">
      <p class="text-sm text-danger">{{ error }}</p>
      <BaseButton class="mt-3" variant="ghost" size="sm" @click="loadBoard">
        {{ t('common.retry') }}
      </BaseButton>
    </div>

    <FunnelBoard v-else :columns="columns" :busy="busy" @move="onMove" />
  </section>
</template>
