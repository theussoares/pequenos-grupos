<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { VisitorStatus } from '~/camadas/visitantes/domain/visitor-status'
import type { InteractionType } from '~/camadas/visitantes/domain/interaction-type'

const { t } = useI18n()
const route = useRoute()
const visitorId = route.params.id as string

const store = useVisitorsStore()
const { activeVisitor, pgs, padrinhos, isLoading, error } = storeToRefs(store)

const { loadVisitor } = useVisitorProfile()
const actions = useVisitorActions()

const busy = ref(false)

onMounted(() => loadVisitor(visitorId))

async function run(action: () => Promise<void>) {
  busy.value = true
  await action()
  busy.value = false
}

function onAdvance(to: VisitorStatus) {
  if (!activeVisitor.value) return
  run(() => actions.advanceStatus(activeVisitor.value!, to))
}

function onRegister(tipo: InteractionType) {
  if (!activeVisitor.value) return
  run(() => actions.registerInteraction(activeVisitor.value!, tipo))
}

function onNote(text: string) {
  if (!activeVisitor.value) return
  run(() => actions.registerInteraction(activeVisitor.value!, 'nota', text))
}

function onPresence() {
  if (!activeVisitor.value) return
  run(() => actions.registerPresence(activeVisitor.value!))
}

function onAssignPg(pgId: string | null) {
  if (!activeVisitor.value) return
  run(() => actions.assignPg(activeVisitor.value!, pgId))
}

function onAssignPadrinho(padrinhoId: string | null) {
  if (!activeVisitor.value) return
  run(() => actions.assignPadrinho(activeVisitor.value!, padrinhoId))
}

function onToggleAmizade(confirmed: boolean) {
  if (!activeVisitor.value) return
  run(() => actions.toggleAmizade(activeVisitor.value!, confirmed))
}

function onSaveResponsabilidade(text: string | null) {
  if (!activeVisitor.value) return
  run(() => actions.setResponsabilidade(activeVisitor.value!, text))
}
</script>

<template>
  <section>
    <NuxtLink
      to="/hoje"
      class="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary"
    >
      <Icon name="lucide:arrow-left" />
      {{ t('profile.back') }}
    </NuxtLink>

    <AppSpinner v-if="isLoading" :label="t('common.loading')" />

    <EmptyState
      v-else-if="!activeVisitor"
      icon="lucide:user-x"
      :title="t('profile.notFound')"
      :description="error ?? undefined"
    />

    <div v-else class="space-y-3">
      <VisitorHeader :visitor="activeVisitor" />

      <VisitorStatusActions
        :status="activeVisitor.status"
        :busy="busy"
        @advance="onAdvance"
      />

      <VisitorRelations
        :visitor="activeVisitor"
        :pgs="pgs"
        :padrinhos="padrinhos"
        :busy="busy"
        @assign-pg="onAssignPg"
        @assign-padrinho="onAssignPadrinho"
        @toggle-amizade="onToggleAmizade"
        @save-responsabilidade="onSaveResponsabilidade"
      />

      <VisitorQuickActions
        :can-register-presence="Boolean(activeVisitor.pgId)"
        :busy="busy"
        @register="onRegister"
        @presence="onPresence"
        @note="onNote"
      />

      <VisitorTimeline />
    </div>
  </section>
</template>
