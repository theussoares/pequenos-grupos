<script setup lang="ts">
import {
  allowedTransitions,
  type VisitorStatus
} from '~/camadas/visitantes/domain/visitor-status'

const props = defineProps<{ status: VisitorStatus; busy?: boolean }>()

defineEmits<{ advance: [to: VisitorStatus] }>()

const { t } = useI18n()

const transitions = computed(() => allowedTransitions(props.status))
</script>

<template>
  <BaseCard>
    <h2 class="mb-3 text-sm font-semibold text-text">
      {{ t('profile.moveVisitor') }}
    </h2>
    <div v-if="transitions.length" class="flex flex-wrap gap-2">
      <BaseButton
        v-for="to in transitions"
        :key="to"
        size="sm"
        variant="ghost"
        :disabled="busy"
        @click="$emit('advance', to)"
      >
        {{ t(`visitor.status.${to}`) }}
      </BaseButton>
    </div>
    <p v-else class="text-sm text-text-muted">
      {{ t('profile.finalStatus') }}
    </p>
  </BaseCard>
</template>
