<script setup lang="ts">
import type { Visitor } from '~/types/visitor'

defineProps<{
  visitor: Visitor
  pgNome: string | null
  pgSchedule: string | null
  whatsappUrl: string | null
  canConfirmPresence: boolean
  busy?: boolean
}>()

defineEmits<{ veio: []; naoVeio: []; mensagem: [] }>()

const { t } = useI18n()
</script>

<template>
  <BaseCard>
    <div class="flex items-start gap-3">
      <BaseAvatar :name="visitor.nome" />
      <div class="min-w-0 flex-1">
        <NuxtLink
          :to="`/visitantes/${visitor.id}`"
          class="truncate font-semibold text-text hover:text-primary"
        >
          {{ visitor.nome }}
        </NuxtLink>
        <p class="mt-0.5 text-sm text-text-muted">
          <span class="font-medium">{{ t('afilhado.nextPg') }}:</span>
          {{ pgNome ?? t('afilhado.noPg') }}
          <span v-if="pgSchedule"> · {{ pgSchedule }}</span>
        </p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-2">
      <BaseButton
        variant="success"
        size="sm"
        :disabled="busy || !canConfirmPresence"
        @click="$emit('veio')"
      >
        <Icon name="lucide:check" />
        {{ t('afilhado.veio') }}
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        :disabled="busy"
        @click="$emit('naoVeio')"
      >
        <Icon name="lucide:x" />
        {{ t('afilhado.naoVeio') }}
      </BaseButton>
      <BaseButton
        v-if="whatsappUrl"
        :href="whatsappUrl"
        external
        variant="ghost"
        size="sm"
      >
        <Icon name="lucide:message-circle" />
        WhatsApp
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        :disabled="busy"
        @click="$emit('mensagem')"
      >
        <Icon name="lucide:send" />
        {{ t('afilhado.mensagem') }}
      </BaseButton>
    </div>
  </BaseCard>
</template>
