<script setup lang="ts">
import type { NuxtError } from '#app'
import { computed } from 'vue'
import { statusCodeOf, statusTextOf } from '@/utils/httpError'

const props = defineProps<{ error: NuxtError }>()

const isDev = import.meta.dev
const statusCode = computed(() => statusCodeOf(props.error) ?? 500)
const message = computed(() => statusTextOf(props.error) ?? 'Não foi possível carregar esta página')

useSeoMeta({
  title: () => `${message.value} (${statusCode.value})`,
  description: () => message.value,
  robots: 'noindex, nofollow',
  ogTitle: () => `${message.value} (${statusCode.value})`,
  ogDescription: () => message.value,
  ogType: 'website',
  twitterCard: 'summary',
})

/** Clears the error state before navigating, otherwise Vue keeps rendering it. */
function goToListing() {
  return clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
    <main
      class="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"
    >
      <p class="text-sm font-semibold text-indigo-600">{{ statusCode }}</p>
      <h1 class="mt-1 text-2xl font-bold text-slate-900">{{ message }}</h1>

      <!-- Dev only: the raw message, when it says something the copy above does not. -->
      <p v-if="isDev && error.message !== message" class="mt-4 text-xs text-slate-400">
        {{ error.message }}
      </p>

      <a
        href="/"
        class="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click.prevent="goToListing"
      >
        Voltar para a listagem
      </a>
    </main>
  </div>
</template>
