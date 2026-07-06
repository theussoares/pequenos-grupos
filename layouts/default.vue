<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const user = useSupabaseUser()
const { signOut } = useAuth()
const router = useRouter()

function toggleLocale() {
  setLocale(locale.value === 'pt' ? 'es' : 'pt')
}

async function onLogout() {
  await signOut()
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-bg">
    <header
      v-if="user"
      class="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-xl items-center justify-between px-4 py-3"
      >
        <NuxtLink to="/hoje" class="flex items-center gap-2 font-semibold">
          <Icon name="lucide:sprout" class="text-primary" />
          <span>{{ t('app.name') }}</span>
        </NuxtLink>
        <div class="flex items-center gap-1">
          <button
            class="rounded-lg px-2 py-1 text-sm text-text-muted hover:bg-surface-muted"
            @click="toggleLocale"
          >
            {{ locale.toUpperCase() }}
          </button>
          <button
            class="rounded-lg px-2 py-1 text-sm text-text-muted hover:bg-surface-muted"
            :aria-label="t('nav.logout')"
            @click="onLogout"
          >
            <Icon name="lucide:log-out" />
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-xl px-4 py-4">
      <slot />
    </main>
  </div>
</template>
