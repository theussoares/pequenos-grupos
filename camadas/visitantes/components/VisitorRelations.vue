<script setup lang="ts">
import type { Visitor } from '~/types/visitor'
import type { Pg } from '~/types/pg'
import type { Profile } from '~/types/profile'

const props = defineProps<{
  visitor: Visitor
  pgs: Pg[]
  padrinhos: Profile[]
  busy?: boolean
}>()

const emit = defineEmits<{
  assignPg: [pgId: string | null]
  assignPadrinho: [padrinhoId: string | null]
  toggleAmizade: [confirmed: boolean]
  saveResponsabilidade: [text: string | null]
}>()

const { t } = useI18n()

const pgOptions = computed(() =>
  props.pgs.map((pg) => ({ value: pg.id, label: pg.nome }))
)

const padrinhoOptions = computed(() =>
  props.padrinhos.map((p) => ({ value: p.id, label: p.nome }))
)

const responsabilidade = ref(props.visitor.responsabilidade ?? '')

watch(
  () => props.visitor.responsabilidade,
  (value) => {
    responsabilidade.value = value ?? ''
  }
)

function saveResponsabilidade() {
  emit('saveResponsabilidade', responsabilidade.value.trim() || null)
}
</script>

<template>
  <BaseCard>
    <h2 class="mb-3 text-sm font-semibold text-text">
      {{ t('profile.relations') }}
    </h2>
    <div class="space-y-3">
      <BaseSelect
        :model-value="visitor.pgId"
        :options="pgOptions"
        :label="t('profile.pg')"
        :placeholder="t('profile.selectPg')"
        @update:model-value="emit('assignPg', $event)"
      />
      <BaseSelect
        :model-value="visitor.padrinhoId"
        :options="padrinhoOptions"
        :label="t('profile.padrinho')"
        :placeholder="t('profile.selectPadrinho')"
        @update:model-value="emit('assignPadrinho', $event)"
      />

      <label class="flex items-center gap-2 text-sm text-text">
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
          :checked="visitor.amizadeConfirmada"
          :disabled="busy"
          @change="
            emit(
              'toggleAmizade',
              ($event.target as HTMLInputElement).checked
            )
          "
        >
        {{ t('profile.amizadeConfirmada') }}
      </label>

      <div>
        <label
          class="mb-1 block text-xs font-medium uppercase tracking-wide text-text-muted"
        >
          {{ t('profile.responsabilidade') }}
        </label>
        <div class="flex gap-2">
          <input
            v-model="responsabilidade"
            type="text"
            :placeholder="t('profile.responsabilidadePlaceholder')"
            class="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
          <BaseButton
            size="sm"
            variant="ghost"
            :disabled="busy"
            @click="saveResponsabilidade"
          >
            {{ t('common.save') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
