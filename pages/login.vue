<script setup lang="ts">
const { t } = useI18n()
const { isSubmitting, error, signInWithPassword } = useAuth()

const email = ref('')
const password = ref('')

async function onSubmit() {
  const ok = await signInWithPassword(email.value, password.value)
  if (ok) await navigateTo('/hoje')
}
</script>

<template>
  <div class="mx-auto mt-10 max-w-sm">
    <div class="mb-6 text-center">
      <Icon name="lucide:sprout" class="text-3xl text-primary" />
      <h1 class="mt-2 text-xl font-semibold text-text">{{ t('app.name') }}</h1>
      <p class="text-sm text-text-muted">{{ t('auth.subtitle') }}</p>
    </div>

    <BaseCard>
      <form class="space-y-3" @submit.prevent="onSubmit">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-text">
            {{ t('auth.email') }}
          </span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-text">
            {{ t('auth.password') }}
          </span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
        </label>

        <p v-if="error" class="text-sm text-danger">{{ t('auth.error') }}</p>

        <BaseButton block type="submit" :loading="isSubmitting">
          {{ t('auth.signIn') }}
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>
