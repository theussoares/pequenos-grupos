<script setup lang="ts">
import type { BoardCard, Visitor } from '~/types/visitor'
import type {
  VisitorStatus
} from '~/camadas/visitantes/domain/visitor-status'
import type { FunnelColumnStatus } from '~/camadas/visitantes/domain/funnel-board'

defineProps<{
  status: FunnelColumnStatus
  cards: BoardCard[]
  busy?: boolean
}>()

const emit = defineEmits<{
  cardMove: [visitor: Visitor, to: VisitorStatus]
  drop: [status: FunnelColumnStatus]
  dragstart: [visitor: Visitor]
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="flex w-64 shrink-0 flex-col rounded-2xl bg-surface-muted/60 p-2"
    @dragover.prevent
    @drop="emit('drop', status)"
  >
    <header class="mb-2 flex items-center justify-between px-1">
      <span class="text-sm font-semibold text-text">
        {{ t(`visitor.status.${status}`) }}
      </span>
      <BaseBadge>{{ cards.length }}</BaseBadge>
    </header>

    <div class="min-h-12 space-y-2">
      <FunnelCard
        v-for="card in cards"
        :key="card.visitor.id"
        :card="card"
        :busy="busy"
        @move="(to) => emit('cardMove', card.visitor, to)"
        @dragstart="emit('dragstart', $event)"
      />
      <p v-if="!cards.length" class="px-1 py-2 text-xs text-text-muted">
        {{ t('kanban.empty') }}
      </p>
    </div>
  </div>
</template>
