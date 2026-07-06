<script setup lang="ts">
withDefaults(
  defineProps<{ icon?: string; title: string; description?: string }>(),
  { icon: 'lucide:inbox', description: undefined }
)
</script>

<template>
  <div class="flex flex-col items-center gap-2 py-12 text-center">
    <Icon :name="icon" class="text-3xl text-text-muted" />
    <p class="font-medium text-text">{{ title }}</p>
    <p v-if="description" class="max-w-xs text-sm text-text-muted">
      {{ description }}
    </p>
  </div>
</template>
