<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Pg } from '~/types/pg'
import type { PgInput } from '~/schemas/pg'

const { t } = useI18n()
const visitorsStore = useVisitorsStore()
const { isAdmin } = storeToRefs(visitorsStore)
const { loadProfile } = useCurrentProfile()

const pgsStore = usePgsStore()
const { pgs, activePgs, inactivePgs, leaderCandidates, error } =
  storeToRefs(pgsStore)

const { loadPgs } = usePgsData()
const actions = usePgActions()

const ready = ref(false)
const showCreateForm = ref(false)
const busy = ref(false)

const leaderOptions = computed(() =>
  leaderCandidates.value.map((p) => ({ value: p.id, label: p.nome }))
)

onMounted(async () => {
  await loadProfile()
  if (!isAdmin.value) {
    await navigateTo('/hoje')
    return
  }
  await loadPgs()
  ready.value = true
})

async function run(action: () => Promise<boolean>) {
  busy.value = true
  const ok = await action()
  busy.value = false
  return ok
}

async function onCreate(payload: PgInput) {
  if (await run(() => actions.createPg(payload))) showCreateForm.value = false
}

function onAssignLeader(pg: Pg, liderId: string | null) {
  run(() => actions.assignLeader(pg, liderId))
}

function onToggleAtivo(pg: Pg, ativo: boolean) {
  run(() => actions.toggleAtivo(pg, ativo))
}

function onSave(pg: Pg, patch: PgInput) {
  run(() => actions.updatePgDetails(pg, patch))
}
</script>

<template>
  <section>
    <header class="mb-4 flex items-start justify-between gap-2">
      <div>
        <h1 class="text-xl font-semibold text-text">{{ t('pgs.title') }}</h1>
        <p class="text-sm text-text-muted">{{ t('pgs.subtitle') }}</p>
      </div>
      <BaseButton
        size="sm"
        :disabled="showCreateForm"
        @click="showCreateForm = true"
      >
        <Icon name="lucide:plus" />
        {{ t('pgs.newPg') }}
      </BaseButton>
    </header>

    <AppSpinner v-if="!ready && !error" :label="t('common.loading')" />

    <div v-else-if="error && !ready" class="text-center">
      <p class="text-sm text-danger">{{ error }}</p>
      <BaseButton class="mt-3" variant="ghost" size="sm" @click="loadPgs">
        {{ t('common.retry') }}
      </BaseButton>
    </div>

    <div v-else class="space-y-3">
      <BaseCard v-if="showCreateForm">
        <PgForm
          :submit-label="t('pgs.create')"
          :busy="busy"
          @submit="onCreate"
          @cancel="showCreateForm = false"
        />
      </BaseCard>

      <EmptyState
        v-if="!pgs.length && !showCreateForm"
        icon="lucide:house"
        :title="t('pgs.empty')"
      />

      <template v-else>
        <PgCard
          v-for="pg in activePgs"
          :key="pg.id"
          :pg="pg"
          :leader-options="leaderOptions"
          :busy="busy"
          @assign-leader="(liderId) => onAssignLeader(pg, liderId)"
          @toggle-ativo="(ativo) => onToggleAtivo(pg, ativo)"
          @save="(patch) => onSave(pg, patch)"
        />

        <template v-if="inactivePgs.length">
          <h2 class="pt-2 text-sm font-semibold text-text-muted">
            {{ t('pgs.inactiveSection') }}
          </h2>
          <PgCard
            v-for="pg in inactivePgs"
            :key="pg.id"
            :pg="pg"
            :leader-options="leaderOptions"
            :busy="busy"
            @assign-leader="(liderId) => onAssignLeader(pg, liderId)"
            @toggle-ativo="(ativo) => onToggleAtivo(pg, ativo)"
            @save="(patch) => onSave(pg, patch)"
          />
        </template>
      </template>
    </div>
  </section>
</template>
