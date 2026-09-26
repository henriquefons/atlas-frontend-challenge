<script setup lang="ts">
/**
 * Professionals listing page.
 *
 * Orchestrates the professionalStore: syncs the filters with the URL, triggers
 * loads and renders the list. Components stay presentational.
 */
import { PROFESSIONAL_CATEGORIES } from '@/constants/professional'

const professionalStore = useProfessionalsStore()
const route = useRoute()
const { syncFromUrl } = useListingQuerySync()

// Everything reactive is registered before the first `await`: hooks added after
// an await in setup() are dropped, so the observer would never start.

/** Sentinel element observed to load the next page. */
const loadMoreTrigger = ref<Element | null>(null)

const { supported: infiniteScrollSupported } = useInfiniteScroll(
  loadMoreTrigger,
  () => professionalStore.loadNextPage(),
  {
    enabled: () =>
      professionalStore.hasMore &&
      professionalStore.loading === 'idle' &&
      !professionalStore.errorFirst &&
      !professionalStore.errorNext,
    // Appending items is what can push the sentinel back into the viewport.
    watch: () => professionalStore.items.length,
  },
)

// Initial load + reload when the URL changes. Unchanged filters are a no-op, so
// coming back from a profile keeps the items and the restored scroll. The
// `true` is deliberate: the store already holds the items, so returning them
// would duplicate the array in the SSR payload.
await useAsyncData(
  'professionals',
  async () => {
    syncFromUrl()
    await professionalStore.loadFirstPage()
    return true
  },
  { watch: [() => route.fullPath] },
)

const resultsLabel = computed(() => {
  if (professionalStore.isLoadingFirst) return 'Carregando...'
  if (professionalStore.errorFirst) return 'Não foi possível carregar a lista'
  if (professionalStore.isEmpty) return 'Nenhum resultado'
  if (professionalStore.total === 1) return '1 profissional encontrado'
  return `Mostrando ${professionalStore.items.length} de ${professionalStore.total} profissionais`
})

/** Only offer "back to top" once the list is long enough to need it. */
const showBackToTop = computed(() => professionalStore.items.length >= 40)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// States overlap (e.g. a reload with `total` from the previous filters), so
// this is one computed instead of a `v-if` chain in the template.
const footerState = computed(() => {
  if (professionalStore.isLoadingNext) return 'loading-more'
  if (professionalStore.errorNext) return 'error-more'
  if (professionalStore.isLoadingFirst || professionalStore.errorFirst || professionalStore.isEmpty)
    return 'idle'
  return professionalStore.hasMore ? 'can-load-more' : 'done'
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Catálogo de Profissionais</h1>
      <p class="mt-1 text-slate-600">
        Encontre profissionais autônomos por categoria, preço, avaliação e distância.
      </p>
    </header>

    <!-- Controls -->
    <section class="mb-6 space-y-4" aria-label="Busca e filtros">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
        <div class="sm:col-span-2">
          <ProfessionalSearch v-model="professionalStore.search" />
        </div>
        <ProfessionalSort v-model="professionalStore.sort" />
      </div>
      <ProfessionalFilters
        v-model="professionalStore.category"
        :categories="PROFESSIONAL_CATEGORIES"
      />
    </section>

    <!-- Results summary -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-slate-600" aria-live="polite">{{ resultsLabel }}</p>
      <BaseButton
        v-if="professionalStore.hasActiveFilters"
        variant="ghost"
        size="sm"
        @click="professionalStore.clearFilters()"
      >
        Limpar filtros
      </BaseButton>
    </div>

    <!-- List -->
    <ProfessionalList
      :items="professionalStore.items"
      :loading="professionalStore.isLoadingFirst"
      :loading-more="professionalStore.isLoadingNext"
      :error="professionalStore.errorFirst"
      @retry="professionalStore.loadFirstPage({ force: true })"
    />

    <!--
      Infinite scroll sentinel, with a button fallback when IntersectionObserver
      is unavailable. The reserved height avoids a layout shift.
    -->
    <div
      ref="loadMoreTrigger"
      class="mt-8 flex min-h-[44px] items-center justify-center"
      aria-live="polite"
    >
      <p v-if="footerState === 'loading-more'" class="text-sm text-slate-500">
        Carregando mais profissionais...
      </p>

      <div v-else-if="footerState === 'error-more'" class="text-center">
        <p class="text-sm font-medium text-red-700">{{ professionalStore.errorNext }}</p>
        <BaseButton
          class="mt-2"
          size="sm"
          variant="secondary"
          @click="professionalStore.loadNextPage()"
        >
          Tentar novamente
        </BaseButton>
      </div>

      <BaseButton
        v-else-if="footerState === 'can-load-more'"
        v-show="!infiniteScrollSupported"
        variant="secondary"
        @click="professionalStore.loadNextPage()"
      >
        Carregar mais
      </BaseButton>

      <p v-else-if="footerState === 'done'" class="text-sm text-slate-500">
        Você viu todos os {{ professionalStore.total }} profissionais
      </p>
    </div>

    <BaseButton
      v-if="showBackToTop"
      class="fixed bottom-6 right-6 z-10 shadow-lg"
      variant="secondary"
      size="sm"
      @click="scrollToTop"
    >
      Voltar ao topo
    </BaseButton>
  </main>
</template>
