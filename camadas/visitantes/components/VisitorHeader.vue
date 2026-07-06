<script setup lang="ts">
import type { Visitor } from '~/types/visitor'
import { formatDate } from '~/camadas/core/utils/date'

const props = defineProps<{ visitor: Visitor }>()

const { t, locale } = useI18n()

const firstVisit = computed(() =>
  formatDate(props.visitor.dataPrimeiraVisita, locale.value)
)
</script>

<template>
  <BaseCard>
    <div class="flex items-start gap-3">
      <BaseAvatar :name="visitor.nome" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="truncate text-lg font-semibold text-text">
            {{ visitor.nome }}
          </h1>
          <VisitorStatusBadge :status="visitor.status" />
        </div>
        <p class="mt-1 text-sm text-text-muted">
          {{ t('profile.firstVisit', { date: firstVisit }) }}
        </p>
        <div
          v-if="visitor.telefone"
          class="mt-0.5 flex items-center gap-1.5 text-sm text-text-muted"
        >
          <Icon name="lucide:phone" />
          <span>{{ visitor.telefone }}</span>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
