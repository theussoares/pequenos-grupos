<script setup lang="ts">
import type { Pg } from '~/types/pg'
import type { PgInput } from '~/schemas/pg'

interface LeaderOption {
  value: string
  label: string
}

const props = defineProps<{
  pg: Pg
  leaderOptions: LeaderOption[]
  busy?: boolean
}>()

const emit = defineEmits<{
  assignLeader: [liderId: string | null]
  toggleAtivo: [ativo: boolean]
  save: [patch: PgInput]
}>()

const { t } = useI18n()
const editing = ref(false)

const schedule = computed(() => {
  const weekday = t(`weekday.${props.pg.diaSemana}`)
  return props.pg.horario ? `${weekday} · ${props.pg.horario.slice(0, 5)}` : weekday
})

function onSave(payload: PgInput) {
  emit('save', payload)
  editing.value = false
}
</script>

<template>
  <BaseCard>
    <template v-if="editing">
      <PgForm
        :nome="pg.nome"
        :dia-semana="pg.diaSemana"
        :horario="pg.horario"
        :endereco="pg.endereco"
        :submit-label="t('common.save')"
        :busy="busy"
        @submit="onSave"
        @cancel="editing = false"
      />
    </template>

    <template v-else>
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="truncate font-semibold text-text">{{ pg.nome }}</p>
            <BaseBadge :tone="pg.ativo ? 'success' : 'neutral'">
              {{ pg.ativo ? t('pgs.active') : t('pgs.inactive') }}
            </BaseBadge>
          </div>
          <p class="mt-0.5 text-sm text-text-muted">{{ schedule }}</p>
          <p v-if="pg.endereco" class="text-sm text-text-muted">
            {{ pg.endereco }}
          </p>
        </div>
        <BaseButton
          size="sm"
          variant="ghost"
          :disabled="busy"
          @click="editing = true"
        >
          <Icon name="lucide:pencil" />
        </BaseButton>
      </div>

      <div class="mt-3 space-y-3">
        <BaseSelect
          :model-value="pg.liderId"
          :options="leaderOptions"
          :label="t('pgs.leader')"
          :placeholder="t('pgs.selectLeader')"
          @update:model-value="emit('assignLeader', $event)"
        />

        <label class="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
            :checked="pg.ativo"
            :disabled="busy"
            @change="
              emit('toggleAtivo', ($event.target as HTMLInputElement).checked)
            "
          >
          {{ t('pgs.active') }}
        </label>
      </div>
    </template>
  </BaseCard>
</template>
