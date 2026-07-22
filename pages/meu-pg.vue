<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Visitor } from '~/types/visitor'

const { t } = useI18n()
const store = useVisitorsStore()
const { currentProfile } = storeToRefs(store)
const { loadProfile } = useCurrentProfile()

const { pg, visitors, padrinhoOptions, isLoading, error, load } =
  useMyPgRoster()
const actions = useVisitorActions()

const ready = ref(false)
const busyId = ref<string | null>(null)

const schedule = computed(() => {
  if (!pg.value) return ''
  const weekday = t(`weekday.${pg.value.diaSemana}`)
  return pg.value.horario
    ? `${weekday} · ${pg.value.horario.slice(0, 5)}`
    : weekday
})

const padrinhoSelectOptions = computed(() =>
  padrinhoOptions.value.map((p) => ({ value: p.id, label: p.nome }))
)

onMounted(async () => {
  await loadProfile()
  await load()
  ready.value = true
})

async function onAssignPadrinho(visitor: Visitor, padrinhoId: string | null) {
  busyId.value = visitor.id
  await actions.assignPadrinho(visitor, padrinhoId)
  await load()
  busyId.value = null
}
</script>

<template>
  <section>
    <header class="mb-4">
      <h1 class="text-xl font-semibold text-text">{{ t('meuPg.title') }}</h1>
      <p v-if="pg" class="text-sm text-text-muted">
        {{ pg.nome }} · {{ schedule }}
      </p>
    </header>

    <AppSpinner v-if="!ready || isLoading" :label="t('common.loading')" />

    <div v-else-if="error" class="text-center">
      <p class="text-sm text-danger">{{ error }}</p>
      <BaseButton class="mt-3" variant="ghost" size="sm" @click="load">
        {{ t('common.retry') }}
      </BaseButton>
    </div>

    <EmptyState
      v-else-if="!currentProfile?.pgId"
      icon="lucide:house"
      :title="t('meuPg.noPg')"
      :description="t('meuPg.noPgDescription')"
    />

    <EmptyState
      v-else-if="!visitors.length"
      icon="lucide:users"
      :title="t('meuPg.empty')"
    />

    <div v-else class="space-y-3">
      <BaseCard v-for="visitor in visitors" :key="visitor.id">
        <div class="flex items-center gap-3">
          <BaseAvatar :name="visitor.nome" />
          <div class="min-w-0 flex-1">
            <NuxtLink
              :to="`/visitantes/${visitor.id}`"
              class="truncate font-medium text-text hover:text-primary"
            >
              {{ visitor.nome }}
            </NuxtLink>
            <div>
              <VisitorStatusBadge :status="visitor.status" />
            </div>
          </div>
        </div>

        <div class="mt-3">
          <BaseSelect
            :model-value="visitor.padrinhoId"
            :options="padrinhoSelectOptions"
            :placeholder="t('profile.selectPadrinho')"
            :disabled="busyId === visitor.id"
            @update:model-value="(padrinhoId) => onAssignPadrinho(visitor, padrinhoId)"
          />
        </div>
      </BaseCard>
    </div>
  </section>
</template>
