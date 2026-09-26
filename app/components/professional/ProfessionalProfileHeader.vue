<script setup lang="ts">
import type { Professional } from '@/types/professional'

const props = defineProps<{ professional: Professional }>()

const price = computed(() => formatBRL(props.professional.price))
const rating = computed(() => formatRating(props.professional.rating))
const distance = computed(() => formatDistance(props.professional.distanceKm))
</script>

<template>
  <header class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-start">
      <ProfessionalAvatar :name="professional.name" :src="professional.avatarUrl" size="lg" />

      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-bold text-slate-900">{{ professional.name }}</h1>
        <p class="mt-0.5 text-lg text-slate-600">{{ professional.profession }}</p>

        <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
          <span class="inline-flex items-center gap-1">
            <svg
              class="h-4 w-4 text-amber-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
              />
            </svg>
            <span class="font-medium text-slate-700">{{ rating }}</span>
            <span class="sr-only">de avaliação média</span>
          </span>
          <span aria-hidden="true">·</span>
          <span class="inline-flex items-center gap-1">
            <svg
              class="h-4 w-4 text-slate-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9.7 18.3a1 1 0 00.6 0c.2-.1 4.7-2.3 4.7-8.3a5 5 0 10-10 0c0 6 4.5 8.2 4.7 8.3zM10 12a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ distance }}</span>
          </span>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <BaseBadge variant="primary">{{ professional.category }}</BaseBadge>
          <BaseBadge>{{ professional.city }}</BaseBadge>
        </div>
      </div>

      <div class="shrink-0 sm:text-right">
        <span class="text-xs text-slate-500">A partir de</span>
        <p class="text-2xl font-bold text-slate-900">{{ price }}</p>
      </div>
    </div>
  </header>
</template>
