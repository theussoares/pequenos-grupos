<script setup lang="ts">
interface SelectOption {
  value: string
  label: string
}

defineProps<{
  modelValue: string | null
  options: SelectOption[]
  placeholder?: string
  label?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:modelValue', value === '' ? null : value)
}
</script>

<template>
  <label class="block">
    <span
      v-if="label"
      class="mb-1 block text-xs font-medium uppercase tracking-wide text-text-muted"
    >
      {{ label }}
    </span>
    <select
      :value="modelValue ?? ''"
      class="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      @change="onChange"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
