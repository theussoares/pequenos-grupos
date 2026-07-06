<script setup lang="ts">
import type { BoardCard } from '~/types/visitor'
import {
  allowedTransitions,
  type VisitorStatus
} from '~/camadas/visitantes/domain/visitor-status'

const props = defineProps<{ card: BoardCard; busy?: boolean }>()

const emit = defineEmits<{
  move: [to: VisitorStatus]
  dragstart: [visitor: BoardCard['visitor']]
}>()

const { t } = useI18n()

const menuOpen = ref(false)
const transitions = computed(() => allowedTransitions(props.card.visitor.status))

function select(to: VisitorStatus) {
  menuOpen.value = false
  emit('move', to)
}
</script>

<template>
  <div
    draggable="true"
    class="cursor-grab rounded-xl border border-border bg-surface p-3 shadow-sm active:cursor-grabbing"
    @dragstart="emit('dragstart', card.visitor)"
  >
    <div class="flex items-start justify-between gap-2">
      <NuxtLink
        :to="`/visitantes/${card.visitor.id}`"
        class="truncate text-sm font-medium text-text hover:text-primary"
      >
        {{ card.visitor.nome }}
      </NuxtLink>
      <BaseBadge v-if="card.isOverdue" tone="danger">
        <Icon name="lucide:clock" />
        {{ t('kanban.overdue') }}
      </BaseBadge>
    </div>

    <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-muted">
      <span>{{ t('kanban.daysInStatus', { count: card.daysInStatus }) }}</span>
      <span v-if="card.padrinhoNome" class="flex items-center gap-1">
        <Icon name="lucide:heart-handshake" />
        {{ card.padrinhoNome }}
      </span>
    </div>

    <div v-if="transitions.length" class="relative mt-2">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-1 text-xs text-text-muted hover:bg-border disabled:opacity-50"
        :disabled="busy"
        @click="menuOpen = !menuOpen"
      >
        <Icon name="lucide:move" />
        {{ t('kanban.move') }}
      </button>
      <div
        v-if="menuOpen"
        class="absolute z-20 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
      >
        <button
          v-for="to in transitions"
          :key="to"
          type="button"
          class="block w-full px-3 py-2 text-left text-sm text-text hover:bg-surface-muted"
          @click="select(to)"
        >
          {{ t(`visitor.status.${to}`) }}
        </button>
      </div>
    </div>
  </div>
</template>
