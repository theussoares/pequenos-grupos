<script setup lang="ts">
import { SIGNUP_ROLES, type SignupRole } from '~/composables/useAuth'

const { t } = useI18n()
const { isSubmitting, error, signInWithPassword, signUp } = useAuth()

const INPUT_CLASS =
  'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'

const ROLE_ICONS: Record<SignupRole, string> = {
  recepcionista: 'lucide:user-plus',
  lider: 'lucide:users',
  padrinho: 'lucide:heart-handshake'
}

const mode = ref<'signin' | 'signup'>('signin')
const nome = ref('')
const email = ref('')
const password = ref('')
const role = ref<SignupRole>('recepcionista')
const info = ref<string | null>(null)

const isSignup = computed(() => mode.value === 'signup')

const landingByRole: Record<SignupRole, string> = {
  recepcionista: '/recepcao',
  lider: '/kanban',
  padrinho: '/meu-afilhado'
}

function toggleMode() {
  mode.value = isSignup.value ? 'signin' : 'signup'
  info.value = null
}

async function onSubmit() {
  info.value = null
  if (isSignup.value) {
    const result = await signUp(
      email.value,
      password.value,
      nome.value,
      role.value
    )
    if (!result.ok) return
    if (result.needsConfirmation) {
      info.value = t('auth.checkEmail')
      return
    }
    await navigateTo(landingByRole[role.value])
    return
  }

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
        <label v-if="isSignup" class="block">
          <span class="mb-1 block text-sm font-medium text-text">
            {{ t('auth.name') }}
          </span>
          <input
            v-model="nome"
            type="text"
            autocomplete="name"
            required
            :class="INPUT_CLASS"
          >
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-text">
            {{ t('auth.email') }}
          </span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :class="INPUT_CLASS"
          >
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-text">
            {{ t('auth.password') }}
          </span>
          <input
            v-model="password"
            type="password"
            :autocomplete="isSignup ? 'new-password' : 'current-password'"
            required
            :class="INPUT_CLASS"
          >
        </label>

        <fieldset v-if="isSignup">
          <legend class="mb-1 text-sm font-medium text-text">
            {{ t('auth.role') }}
          </legend>
          <div class="space-y-2">
            <label
              v-for="option in SIGNUP_ROLES"
              :key="option"
              class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition"
              :class="
                role === option
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface hover:bg-surface-muted'
              "
            >
              <input
                v-model="role"
                type="radio"
                name="role"
                :value="option"
                class="h-4 w-4 border-border text-primary focus:ring-primary/40"
              >
              <Icon :name="ROLE_ICONS[option]" class="text-text-muted" />
              <span class="flex-1">
                <span class="block text-sm font-medium text-text">
                  {{ t(`auth.roles.${option}.label`) }}
                </span>
                <span class="block text-xs text-text-muted">
                  {{ t(`auth.roles.${option}.hint`) }}
                </span>
              </span>
            </label>
          </div>
          <p class="mt-1 text-xs text-text-muted">{{ t('auth.adminNote') }}</p>
        </fieldset>

        <p v-if="error" class="text-sm text-danger">{{ t('auth.error') }}</p>
        <p v-if="info" class="text-sm text-success">{{ info }}</p>

        <BaseButton block type="submit" :loading="isSubmitting">
          {{ isSignup ? t('auth.createAccount') : t('auth.signIn') }}
        </BaseButton>
      </form>

      <button
        type="button"
        class="mt-3 w-full text-center text-sm text-text-muted hover:text-primary"
        @click="toggleMode"
      >
        {{ isSignup ? t('auth.haveAccount') : t('auth.noAccount') }}
      </button>
    </BaseCard>
  </div>
</template>
