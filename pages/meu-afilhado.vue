<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Visitor } from '~/types/visitor'

const { t } = useI18n()
const store = useVisitorsStore()
const { afilhados, pgs, isLoading, error } = storeToRefs(store)

const { loadAfilhados } = useAfilhados()
const { linkFor } = useWhatsappLink()
const actions = useVisitorActions()

const busyId = ref<string | null>(null)

const pgById = computed(() =>
  Object.fromEntries(pgs.value.map((pg) => [pg.id, pg]))
)

onMounted(loadAfilhados)

function pgNome(visitor: Visitor): string | null {
  return visitor.pgId ? (pgById.value[visitor.pgId]?.nome ?? null) : null
}

function pgSchedule(visitor: Visitor): string | null {
  const pg = visitor.pgId ? pgById.value[visitor.pgId] : null
  if (!pg) return null
  const time = pg.horario ? ` · ${pg.horario.slice(0, 5)}` : ''
  return `${t(`weekday.${pg.diaSemana}`)}${time}`
}

async function withBusy(visitor: Visitor, action: () => Promise<void>) {
  busyId.value = visitor.id
  await action()
  busyId.value = null
}

function onVeio(visitor: Visitor) {
  withBusy(visitor, () => actions.registerPresence(visitor))
}

function onNaoVeio(visitor: Visitor) {
  withBusy(visitor, () =>
    actions.registerInteraction(visitor, 'nota', t('afilhado.missedNote'))
  )
}

function onMensagem(visitor: Visitor) {
  withBusy(visitor, () => actions.registerInteraction(visitor, 'mensagem'))
}
</script>

<template>
  <section>
    <header class="mb-4">
      <h1 class="text-xl font-semibold text-text">{{ t('afilhado.title') }}</h1>
      <p class="text-sm text-text-muted">{{ t('afilhado.subtitle') }}</p>
    </header>

    <AppSpinner v-if="isLoading" :label="t('common.loading')" />

    <div v-else-if="error" class="text-center">
      <p class="text-sm text-danger">{{ error }}</p>
      <BaseButton class="mt-3" variant="ghost" size="sm" @click="loadAfilhados">
        {{ t('common.retry') }}
      </BaseButton>
    </div>

    <EmptyState
      v-else-if="!afilhados.length"
      icon="lucide:heart-handshake"
      :title="t('afilhado.empty')"
      :description="t('afilhado.emptyDescription')"
    />

    <div v-else class="space-y-3">
      <AfilhadoCard
        v-for="visitor in afilhados"
        :key="visitor.id"
        :visitor="visitor"
        :pg-nome="pgNome(visitor)"
        :pg-schedule="pgSchedule(visitor)"
        :whatsapp-url="linkFor(visitor)"
        :can-confirm-presence="Boolean(visitor.pgId)"
        :busy="busyId === visitor.id"
        @veio="onVeio(visitor)"
        @nao-veio="onNaoVeio(visitor)"
        @mensagem="onMensagem(visitor)"
      />
    </div>
  </section>
</template>
