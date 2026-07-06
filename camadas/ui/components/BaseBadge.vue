<script setup lang="ts">
type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

const props = withDefaults(defineProps<{ tone?: Tone }>(), { tone: 'neutral' })

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-text-muted',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger'
}

const classes = computed(() => [
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  TONE_CLASSES[props.tone]
])
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
