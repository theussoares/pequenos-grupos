<script setup lang="ts">
const props = defineProps<{ name: string }>()

const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
)
</script>

<template>
  <span
    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
    :aria-label="name"
  >
    {{ initials }}
  </span>
</template>
