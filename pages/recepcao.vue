<script setup lang="ts">
import { formatRelativeToNow } from '~/camadas/core/utils/date'
import { maskPhone } from '~/camadas/visitantes/domain/phone-mask'

const { t, locale } = useI18n()
const { register, isSubmitting, error, recentlyAdded } = useVisitorRegistration()

const INPUT_CLASS =
  'w-full rounded-xl border border-border bg-surface px-3 py-3 text-base text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'

const nome = ref('')
const telefone = ref('')
const idade = ref('')
const bairro = ref('')
const pontoReferencia = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

const now = ref(new Date())

function reset() {
  nome.value = ''
  telefone.value = ''
  idade.value = ''
  bairro.value = ''
  pontoReferencia.value = ''
  nameInput.value?.focus()
}

function onPhoneInput(event: Event) {
  telefone.value = maskPhone((event.target as HTMLInputElement).value)
}

function onIdadeInput(event: Event) {
  idade.value = (event.target as HTMLInputElement).value
    .replace(/\D/g, '')
    .slice(0, 2)
}

async function onSubmit() {
  const ok = await register({
    nome: nome.value,
    telefone: telefone.value || undefined,
    idade: idade.value ? Number(idade.value) : undefined,
    bairro: bairro.value.trim() || undefined,
    pontoReferencia: pontoReferencia.value.trim() || undefined
  })
  if (ok) reset()
}
</script>

<template>
  <section>
    <header class="mb-4">
      <h1 class="text-xl font-semibold text-text">{{ t('reception.title') }}</h1>
      <p class="text-sm text-text-muted">{{ t('reception.subtitle') }}</p>
    </header>

    <BaseCard>
      <form class="space-y-3" @submit.prevent="onSubmit">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-text">
            {{ t('reception.name') }}
          </span>
          <input
            ref="nameInput"
            v-model="nome"
            type="text"
            autofocus
            required
            :placeholder="t('reception.namePlaceholder')"
            :class="INPUT_CLASS"
          >
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-text">
            {{ t('reception.phone') }}
          </span>
          <input
            :value="telefone"
            type="tel"
            inputmode="numeric"
            :placeholder="t('reception.phonePlaceholder')"
            :class="INPUT_CLASS"
            @input="onPhoneInput"
          >
        </label>

        <div class="grid grid-cols-[5rem_1fr] gap-3">
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-text">
              {{ t('reception.age') }}
            </span>
            <input
              :value="idade"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="2"
              placeholder="18"
              :class="INPUT_CLASS"
              @input="onIdadeInput"
            >
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-text">
              {{ t('reception.bairro') }}
            </span>
            <input
              v-model="bairro"
              type="text"
              :placeholder="t('reception.bairroPlaceholder')"
              :class="INPUT_CLASS"
            >
          </label>
        </div>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-text">
            {{ t('reception.pontoReferencia') }}
          </span>
          <input
            v-model="pontoReferencia"
            type="text"
            :placeholder="t('reception.pontoReferenciaPlaceholder')"
            :class="INPUT_CLASS"
          >
        </label>

        <p v-if="error" class="text-sm text-danger">
          {{ error === 'validation' ? t('reception.invalid') : error }}
        </p>

        <BaseButton block type="submit" :loading="isSubmitting">
          <Icon name="lucide:user-plus" />
          {{ t('reception.submit') }}
        </BaseButton>
      </form>
    </BaseCard>

    <div v-if="recentlyAdded.length" class="mt-5">
      <h2 class="mb-2 text-sm font-semibold text-text">
        {{ t('reception.recentTitle') }}
      </h2>
      <ul class="space-y-2">
        <li
          v-for="(item, index) in recentlyAdded"
          :key="index"
          class="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2"
        >
          <Icon name="lucide:circle-check" class="text-success" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-text">{{ item.nome }}</p>
            <p v-if="item.telefone" class="truncate text-xs text-text-muted">
              {{ item.telefone }}
            </p>
          </div>
          <span class="shrink-0 text-xs text-text-muted">
            {{ formatRelativeToNow(new Date(item.registeredAt), now, locale) }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>
