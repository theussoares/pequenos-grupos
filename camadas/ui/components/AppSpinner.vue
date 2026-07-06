<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<template>
  <div class="flex items-center justify-center gap-2 py-8 text-text-muted">
    <Icon name="lucide:loader-circle" class="animate-spin" />
    <span v-if="label" class="text-sm">{{ label }}</span>
  </div>
</template>
