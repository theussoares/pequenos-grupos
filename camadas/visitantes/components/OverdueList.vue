<script setup lang="ts">
import type { OverdueEntry } from '~/camadas/visitantes/domain/metrics'

defineProps<{ entries: OverdueEntry[] }>()

const { t } = useI18n()
</script>

<template>
  <BaseCard>
    <h2 class="mb-3 text-sm font-semibold text-text">
      {{ t('metrics.overdueTitle') }}
    </h2>

    <EmptyState
      v-if="!entries.length"
      icon="lucide:circle-check"
      :title="t('metrics.overdueEmpty')"
    />

    <ol v-else class="space-y-2">
      <li
        v-for="entry in entries"
        :key="entry.visitorId"
        class="flex items-center justify-between gap-2"
      >
        <NuxtLink
          :to="`/visitantes/${entry.visitorId}`"
          class="truncate text-sm text-text hover:text-primary"
        >
          {{ entry.nome }}
        </NuxtLink>
        <BaseBadge tone="danger">
          {{ t('metrics.daysOverdue', { count: entry.daysOverdue }) }}
        </BaseBadge>
      </li>
    </ol>
  </BaseCard>
</template>
