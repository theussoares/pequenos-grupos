<script setup lang="ts">
const { t } = useI18n()

useHead({
  titleTemplate: (title) => (title ? `${title} · ${t('app.name')}` : t('app.name'))
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
