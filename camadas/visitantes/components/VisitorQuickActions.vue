<script setup lang="ts">
import type { InteractionType } from '~/camadas/visitantes/domain/interaction-type'
import { QUICK_INTERACTION_TYPES } from '~/camadas/visitantes/domain/interaction-type'

defineProps<{ canRegisterPresence: boolean; busy?: boolean }>()

const emit = defineEmits<{
  register: [tipo: InteractionType]
  presence: []
  note: [text: string]
}>()

const { t } = useI18n()

const ICON_BY_TYPE: Record<string, string> = {
  mensagem: 'lucide:message-circle',
  ligacao: 'lucide:phone',
  presenca_culto: 'lucide:church',
  visita: 'lucide:house',
  nota: 'lucide:sticky-note'
}

const noteText = ref('')

const quickButtons = computed(() =>
  QUICK_INTERACTION_TYPES.filter((tipo) => tipo !== 'nota')
)

function submitNote() {
  const text = noteText.value.trim()
  if (!text) return
  emit('note', text)
  noteText.value = ''
}
</script>

<template>
  <BaseCard>
    <h2 class="mb-3 text-sm font-semibold text-text">
      {{ t('profile.quickActions') }}
    </h2>

    <div class="flex flex-wrap gap-2">
      <BaseButton
        v-for="tipo in quickButtons"
        :key="tipo"
        size="sm"
        variant="ghost"
        :disabled="busy"
        @click="emit('register', tipo)"
      >
        <Icon :name="ICON_BY_TYPE[tipo]" />
        {{ t(`interaction.type.${tipo}`) }}
      </BaseButton>
      <BaseButton
        size="sm"
        variant="ghost"
        :disabled="busy || !canRegisterPresence"
        @click="emit('presence')"
      >
        <Icon name="lucide:users" />
        {{ t('interaction.type.presenca_pg') }}
      </BaseButton>
    </div>

    <div class="mt-3 flex gap-2">
      <input
        v-model="noteText"
        type="text"
        :placeholder="t('profile.notePlaceholder')"
        class="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        @keyup.enter="submitNote"
      >
      <BaseButton size="sm" :disabled="busy" @click="submitNote">
        <Icon name="lucide:plus" />
      </BaseButton>
    </div>
  </BaseCard>
</template>
