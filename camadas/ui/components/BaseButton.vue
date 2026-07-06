<script setup lang="ts">
type Variant = 'primary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    disabled?: boolean
    loading?: boolean
    href?: string
    external?: boolean
    block?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    href: undefined,
    external: false,
    block: false,
    type: 'button'
  }
)

defineEmits<{ click: [event: MouseEvent] }>()

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-primary text-primary-contrast hover:opacity-90',
  ghost: 'bg-surface-muted text-text hover:bg-border',
  danger: 'bg-danger/10 text-danger hover:bg-danger/20',
  success: 'bg-success/10 text-success hover:bg-success/20'
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2'
}

const classes = computed(() => [
  'inline-flex items-center justify-center rounded-xl font-medium transition',
  'disabled:opacity-50 disabled:pointer-events-none focus:outline-none',
  'focus-visible:ring-2 focus-visible:ring-primary/40',
  VARIANT_CLASSES[props.variant],
  SIZE_CLASSES[props.size],
  props.block ? 'w-full' : ''
])
</script>

<template>
  <a
    v-if="href"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="classes"
  >
    <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
    <slot />
  </a>
  <button
    v-else
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
    <slot />
  </button>
</template>
