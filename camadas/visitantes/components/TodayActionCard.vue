<script setup lang="ts">
import type { TodayAction } from '~/types/visitor'

defineProps<{
  action: TodayAction
  whatsappUrl: string | null
  now: Date
  busy?: boolean
}>()

defineEmits<{ contacted: [] }>()

const { t } = useI18n()
</script>

<template>
  <BaseCard>
    <div class="flex items-start gap-3">
      <BaseAvatar :name="action.visitor.nome" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <NuxtLink
            :to="`/visitantes/${action.visitor.id}`"
            class="truncate font-semibold text-text hover:text-primary"
          >
            {{ action.visitor.nome }}
          </NuxtLink>
          <VisitorStatusBadge :status="action.visitor.status" />
          <SlaBadge
            :urgency="action.urgency"
            :deadline="action.deadline"
            :now="now"
          />
        </div>

        <dl class="mt-1 space-y-0.5 text-sm text-text-muted">
          <div v-if="action.pgNome" class="flex items-center gap-1.5">
            <Icon name="lucide:users" />
            <span>{{ action.pgNome }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Icon name="lucide:heart-handshake" />
            <span>
              {{ action.padrinhoNome ?? t('visitor.noPadrinho') }}
            </span>
          </div>
        </dl>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <BaseButton
        v-if="whatsappUrl"
        :href="whatsappUrl"
        external
        size="sm"
        variant="success"
      >
        <Icon name="lucide:message-circle" />
        {{ t('today.sendWhatsapp') }}
      </BaseButton>
      <BaseButton
        size="sm"
        variant="ghost"
        :loading="busy"
        @click="$emit('contacted')"
      >
        <Icon name="lucide:check" />
        {{ t('today.registerContact') }}
      </BaseButton>
    </div>
  </BaseCard>
</template>
