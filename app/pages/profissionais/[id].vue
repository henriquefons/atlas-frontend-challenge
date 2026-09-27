<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const professionalStore = useProfessionalsStore()
const id = route.params.id as string

const { error } = await useAsyncData(`professional-${id}`, () => professionalStore.loadById(id))

if (error.value) throw error.value

const professional = computed(() => professionalStore.professional!)

/** Lets vue-router hand `savedPosition` to Nuxt's scrollBehavior; otherwise the `href` handles it. */
function handleBack(event: MouseEvent) {
  // Modifiers and middle click keep the native behaviour (new tab).
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return

  const back = (window.history.state as { back?: string } | null)?.back
  if (!back) return // direct visit: nothing cached to restore, `href` loads the listing

  event.preventDefault()
  // Only a listing entry restores the scroll; another profile would not.
  if (back === '/' || back.startsWith('/?')) router.back()
  else router.push('/')
}

useSeoMeta({
  title: () => `${professional.value.name} — ${professional.value.profession}`,
  description: () => professional.value.description,
})
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <a
      href="/"
      class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      @click="handleBack"
    >
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M12.7 15.7a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 111.4 1.4L8.4 10l4.3 4.3a1 1 0 010 1.4z"
          clip-rule="evenodd"
        />
      </svg>
      Voltar para a listagem
    </a>

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
