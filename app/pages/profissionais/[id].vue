<script setup lang="ts">
/**
 * Professional profile page.
 *
 * Loads a single professional by id (SSR-friendly), sets dynamic SEO tags and
 * throws a real 404 when the professional does not exist.
 */
const route = useRoute()
const store = useProfessionalsStore()
const id = route.params.id as string

await useAsyncData(`professional-${id}`, () => store.getProfessionalById(id))

// Real HTTP 404 (correct status for SEO and crawlers).
if (store.error.byId || !store.professional) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Profissional não encontrado',
    fatal: true,
  })
}

const professional = computed(() => store.professional!)

useSeoMeta({
  title: () => `${professional.value.name} — ${professional.value.profession}`,
  description: () => professional.value.description,
})
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Back link -->
    <NuxtLink
      to="/"
      class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
    >
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M12.7 15.7a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 111.4 1.4L8.4 10l4.3 4.3a1 1 0 010 1.4z"
          clip-rule="evenodd"
        />
      </svg>
      Voltar para a listagem
    </NuxtLink>

    <div class="space-y-5">
      <ProfessionalProfileHeader :professional="professional" />

      <section class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <h2 class="text-lg font-semibold text-slate-900">Sobre</h2>
        <p class="mt-3 text-sm leading-relaxed text-slate-700">{{ professional.description }}</p>
      </section>

      <ProfessionalServices :services="professional.services" />
      <ProfessionalAvailability :availability="professional.availability" />
    </div>
  </main>
</template>
