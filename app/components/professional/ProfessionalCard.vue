<script setup lang="ts">
/** Card summarizing a professional in the listing. */
import type { Professional } from '@/types/professional'

const props = defineProps<{ professional: Professional }>()

const price = computed(() => formatBRL(props.professional.price))
const rating = computed(() => formatRating(props.professional.rating))
const distance = computed(() => formatDistance(props.professional.distanceKm))
</script>

<template>
  <article
    class="flex h-full flex-col rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
  >
    <div class="flex items-start gap-3">
      <ProfessionalAvatar :name="professional.name" :src="professional.avatarUrl" size="md" />
      <div class="min-w-0 flex-1">
        <h3 class="truncate font-semibold text-slate-900">{{ professional.name }}</h3>
        <p class="truncate text-sm text-slate-600">{{ professional.profession }}</p>
        <div class="mt-1 flex items-center gap-1 text-sm text-slate-500">
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
          <span aria-hidden="true">·</span>
          <span>{{ distance }}</span>
        </div>
      </div>
    </div>

    <p class="mt-3 line-clamp-2 text-sm text-slate-600">{{ professional.description }}</p>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <BaseBadge variant="primary">{{ professional.category }}</BaseBadge>
      <BaseBadge>{{ professional.city }}</BaseBadge>
    </div>

    <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
      <div>
        <span class="text-xs text-slate-500">A partir de</span>
        <p class="font-semibold text-slate-900">{{ price }}</p>
      </div>
      <NuxtLink
        :to="`/profissionais/${professional.id}`"
        :aria-label="`Ver perfil de ${professional.name}`"
        class="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Ver perfil
      </NuxtLink>
    </div>
  </article>
</template>
