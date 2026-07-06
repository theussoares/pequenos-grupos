<script setup lang="ts">
import type { Visitor } from '~/types/visitor'
import type { FunnelColumn } from '~/camadas/visitantes/composables/useFunnelBoard'
import {
  canTransition,
  type VisitorStatus
} from '~/camadas/visitantes/domain/visitor-status'
import type { FunnelColumnStatus } from '~/camadas/visitantes/domain/funnel-board'

defineProps<{ columns: FunnelColumn[]; busy?: boolean }>()

const emit = defineEmits<{ move: [visitor: Visitor, to: VisitorStatus] }>()

const draggedVisitor = ref<Visitor | null>(null)

function onDragstart(visitor: Visitor) {
  draggedVisitor.value = visitor
}

function onDrop(status: FunnelColumnStatus) {
  const visitor = draggedVisitor.value
  draggedVisitor.value = null
  if (!visitor || !canTransition(visitor.status, status)) return
  emit('move', visitor, status)
}
</script>

<template>
  <div class="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
    <FunnelColumn
      v-for="column in columns"
      :key="column.status"
      :status="column.status"
      :cards="column.cards"
      :busy="busy"
      @drop="onDrop"
      @dragstart="onDragstart"
      @card-move="(visitor, to) => emit('move', visitor, to)"
    />
  </div>
</template>
