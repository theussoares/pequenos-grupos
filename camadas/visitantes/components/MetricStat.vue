<script setup lang="ts">
defineProps<{ label: string; value: string; hint?: string }>()
</script>

<template>
  <BaseCard>
    <p class="text-xs font-medium uppercase tracking-wide text-text-muted">
      {{ label }}
    </p>
    <p class="mt-1 text-2xl font-semibold text-text">{{ value }}</p>
    <p v-if="hint" class="text-xs text-text-muted">{{ hint }}</p>
  </BaseCard>
</template>
