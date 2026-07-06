<script setup lang="ts">
const { items } = useVisitorTimeline()
const { t } = useI18n()
</script>

<template>
  <BaseCard>
    <h2 class="mb-3 text-sm font-semibold text-text">
      {{ t('profile.timeline') }}
    </h2>

    <EmptyState
      v-if="!items.length"
      icon="lucide:history"
      :title="t('profile.emptyTimeline')"
    />

    <ol v-else class="space-y-4">
      <li v-for="item in items" :key="item.id" class="flex gap-3">
        <span
          class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-muted"
        >
          <Icon :name="item.icon" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-text">{{ item.title }}</p>
          <p v-if="item.description" class="text-sm text-text-muted">
            {{ item.description }}
          </p>
          <p class="text-xs text-text-muted">{{ item.when }}</p>
        </div>
      </li>
    </ol>
  </BaseCard>
</template>
