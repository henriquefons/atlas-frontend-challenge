// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/eslint'],

  css: ['@/assets/css/main.css'],

  // UI primitives grouped by purpose. `pathPrefix: false` keeps the component
  // name as-is (BaseButton, BaseInput, ...) regardless of its folder.
  components: [
    { path: '~/components/ui/actions', pathPrefix: false },
    { path: '~/components/ui/forms', pathPrefix: false },
    { path: '~/components/ui/data-display', pathPrefix: false },
    { path: '~/components/professional', pathPrefix: false },
  ],

  typescript: {
    strict: true,
  },

  alias: {
    // `data/` lives outside `app/`, so we expose a dedicated alias.
    '#data': fileURLToPath(new URL('./data', import.meta.url)),
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Catálogo de Profissionais',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Encontre profissionais autônomos por categoria, preço, avaliação e distância.',
        },
      ],
    },
  },
})
