<script setup lang="ts">
import type { PgInput } from '~/schemas/pg'

const props = withDefaults(
  defineProps<{
    nome?: string
    diaSemana?: number
    horario?: string | null
    endereco?: string | null
    submitLabel: string
    busy?: boolean
  }>(),
  {
    nome: '',
    diaSemana: 0,
    horario: null,
    endereco: null,
    busy: false
  }
)

const emit = defineEmits<{ submit: [payload: PgInput]; cancel: [] }>()

const { t } = useI18n()

const INPUT_CLASS =
  'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'

const nome = ref(props.nome)
const diaSemana = ref(props.diaSemana)
const horario = ref(props.horario ?? '')
const endereco = ref(props.endereco ?? '')

const weekdayOptions = computed(() =>
  [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    value: String(day),
    label: t(`weekday.${day}`)
  }))
)

function onSubmit() {
  if (!nome.value.trim()) return
  emit('submit', {
    nome: nome.value.trim(),
    diaSemana: diaSemana.value,
    horario: horario.value.trim() || null,
    endereco: endereco.value.trim() || null
  })
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="onSubmit">
    <label class="block">
      <span class="mb-1 block text-sm font-medium text-text">
        {{ t('pgs.name') }}
      </span>
      <input v-model="nome" type="text" required :class="INPUT_CLASS">
    </label>

    <div class="grid grid-cols-2 gap-3">
      <BaseSelect
        :model-value="String(diaSemana)"
        :options="weekdayOptions"
        :label="t('pgs.weekday')"
        @update:model-value="diaSemana = $event ? Number($event) : 0"
      />
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-text">
          {{ t('pgs.time') }}
        </span>
        <input v-model="horario" type="time" :class="INPUT_CLASS">
      </label>
    </div>

    <label class="block">
      <span class="mb-1 block text-sm font-medium text-text">
        {{ t('pgs.address') }}
      </span>
      <input v-model="endereco" type="text" :class="INPUT_CLASS">
    </label>

    <div class="flex gap-2">
      <BaseButton size="sm" type="submit" :loading="busy">
        {{ submitLabel }}
      </BaseButton>
      <BaseButton
        size="sm"
        variant="ghost"
        type="button"
        :disabled="busy"
        @click="emit('cancel')"
      >
        {{ t('common.cancel') }}
      </BaseButton>
    </div>
  </form>
</template>
