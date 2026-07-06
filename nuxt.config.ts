// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-06',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/supabase',
    '@nuxt/icon',
    '@nuxt/eslint'
  ],

  css: ['~/assets/css/main.css'],

  components: [
    { path: '~/camadas/ui/components', pathPrefix: false },
    { path: '~/camadas/visitantes/components', pathPrefix: false }
  ],

  imports: {
    dirs: ['camadas/**/composables', 'composables']
  },

  pinia: {
    storesDirs: ['./store/**']
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'pt',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root'
    },
    locales: [
      { code: 'pt', language: 'pt-BR', file: 'pt.json', name: 'Português' },
      { code: 'es', language: 'es-ES', file: 'es.json', name: 'Español' }
    ]
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login']
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
