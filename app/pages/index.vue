<script setup lang="ts">
/**
 * Professionals listing page.
 *
 * Orchestrates the store: reads/writes filters to the URL, triggers loads
 * and renders the list. Components stay presentational.
 */
import {
  DEFAULT_SORT,
  isProfessionalCategory,
  isSortOption,
  PROFESSIONAL_CATEGORIES,
} from '@/constants/professional'

const store = useProfessionalsStore()
const route = useRoute()
const router = useRouter()

/** Reads the filters from the URL query into the store. */
function readFromUrl() {
  const { search, category, sort } = route.query
  store.search = typeof search === 'string' ? search : ''
  store.category = isProfessionalCategory(category) ? category : null
  store.sort = isSortOption(sort) ? sort : DEFAULT_SORT
}

/** Serializes the current filters into a URL query object. */
function currentQuery() {
  return {
    ...(store.search ? { search: store.search } : {}),
    ...(store.category ? { category: store.category } : {}),
    ...(store.sort !== DEFAULT_SORT ? { sort: store.sort } : {}),
  }
}

/** Whether the URL query already matches the current filters. */
function queryMatchesFilters() {
  const query = currentQuery()
  const keys = new Set([...Object.keys(query), ...Object.keys(route.query)])
  return [...keys].every((key) => {
    const a = (query as Record<string, unknown>)[key]
    const b = route.query[key]
    return (a ?? '') === (b ?? '')
  })
}

// Initial load (SSR-friendly) + reload whenever the URL changes.
await useAsyncData(
  'professionals',
  async () => {
    readFromUrl()
    await store.reset()
    return true
  },
  { watch: [() => route.fullPath] },
)

watch(
  () => [store.search, store.category, store.sort],
  () => {
    if (queryMatchesFilters()) return
    router.replace({ query: currentQuery() })
  },
)

const resultsLabel = computed(() => {
  if (store.loadingProfessionals) return 'Carregando...'
  const count = store.total
  return count === 1 ? '1 profissional encontrado' : `${count} profissionais encontrados`
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
          <ProfessionalSearch v-model="store.search" />
        </div>
        <ProfessionalSort v-model="store.sort" />
      </div>
      <ProfessionalFilters v-model="store.category" :categories="PROFESSIONAL_CATEGORIES" />
    </section>

    <!-- Results summary -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-slate-600" aria-live="polite">{{ resultsLabel }}</p>
      <BaseButton
        v-if="store.hasActiveFilters"
        variant="ghost"
        size="sm"
        @click="store.clearFilters()"
      >
        Limpar filtros
      </BaseButton>
    </div>

    <!-- List -->
    <ProfessionalList
      :items="store.items"
      :loading="store.loadingProfessionals"
      :error="store.errorProfessionals"
      @retry="store.getProfessionals()"
    />

    <!-- Load more -->
    <div v-if="store.hasMore && !store.loadingProfessionals" class="mt-8 flex justify-center">
      <BaseButton
        variant="secondary"
        :loading="store.loadingMore"
        @click="store.getMoreProfessionals()"
      >
        Carregar mais
      </BaseButton>
    </div>
  </main>
</template>
