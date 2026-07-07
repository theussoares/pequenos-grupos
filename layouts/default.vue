<script setup lang="ts">
import { storeToRefs } from 'pinia'

const { t, locale, setLocale } = useI18n()
const user = useSupabaseUser()
const { signOut } = useAuth()
const { loadProfile } = useCurrentProfile()
const store = useVisitorsStore()
const { isPadrinho, isRecepcionista, isAdmin } = storeToRefs(store)
const router = useRouter()
const route = useRoute()

interface NavItem {
  to: string
  label: string
  icon: string
}

const RECEPTION_ITEM: NavItem = {
  to: '/recepcao',
  label: t('nav.recepcao'),
  icon: 'lucide:user-plus'
}

const navItems = computed<NavItem[]>(() => {
  if (isPadrinho.value) {
    return [
      { to: '/meu-afilhado', label: t('nav.afilhados'), icon: 'lucide:heart-handshake' }
    ]
  }
  if (isRecepcionista.value) return [RECEPTION_ITEM]

  const items: NavItem[] = [
    { to: '/hoje', label: t('nav.today'), icon: 'lucide:list-checks' },
    { to: '/kanban', label: t('nav.kanban'), icon: 'lucide:columns-3' }
  ]
  if (isAdmin.value) {
    items.push(
      { to: '/metricas', label: t('nav.metricas'), icon: 'lucide:chart-column' },
      RECEPTION_ITEM
    )
  }
  return items
})

watch(
  user,
  async (value) => {
    if (!value) return
    await loadProfile()
    if (isRecepcionista.value && route.path === '/hoje') {
      await router.push('/recepcao')
    }
  },
  { immediate: true }
)

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
      <div class="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
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

      <nav class="mx-auto flex max-w-xl gap-1 px-2 pb-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-muted hover:bg-surface-muted"
          active-class="bg-primary/10 text-primary"
        >
          <Icon :name="item.icon" />
          {{ item.label }}
        </NuxtLink>
      </nav>
    </header>

    <main class="mx-auto max-w-xl px-4 py-4">
      <slot />
    </main>
  </div>
</template>
