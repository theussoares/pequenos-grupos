<script setup lang="ts">
const user = useSupabaseUser()
const { t } = useI18n()

watch(
  user,
  (value) => {
    if (value) navigateTo('/hoje')
  },
  { immediate: true }
)
</script>

<template>
  <AppSpinner :label="t('common.loading')" />
</template>
