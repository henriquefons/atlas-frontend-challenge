/**
 * Professionals store (Options API).
 *
 * Owns the reactive state for the listing (items, pagination, filters) and
 * the detail view, orchestrating calls to the API service. Components never
 * call the service directly — they read from this store.
 */
import { DEFAULT_LIMIT, DEFAULT_SORT } from '@/constants/professional'
import { getProfessionalById, getProfessionals } from '@/services/professionals'
import type { Professional, ProfessionalCategory, SortOption } from '@/types/professional'

/** A single request is in flight at a time, so the guards cannot conflict. */
type LoadingState = 'idle' | 'first' | 'next' | 'detail'

interface ProfessionalsState {
  // --- listing ---
  items: Professional[]
  total: number
  page: number
  search: string
  category: ProfessionalCategory | null
  sort: SortOption
  /** Signature of the filters whose results are currently loaded. */
  appliedSignature: string

  // --- detail ---
  professional: Professional | null

  // --- status ---
  loading: LoadingState
  errorFirst: string | null
  errorNext: string | null
  errorById: string | null
}

export const useProfessionalsStore = defineStore('professionals', {
  state: (): ProfessionalsState => ({
    // listing
    items: [],
    total: 0,
    page: 1,
    search: '',
    category: null,
    sort: DEFAULT_SORT,
    appliedSignature: '',

    // detail
    professional: null,

    // status
    loading: 'idle',
    errorFirst: null,
    errorNext: null,
    errorById: null,
  }),

  getters: {
    /** Whether there are more pages to load. */
    hasMore: (state) => state.items.length < state.total,

    /** Whether the listing is empty (and neither loading nor failed). */
    isEmpty: (state) => state.loading !== 'first' && !state.errorFirst && state.items.length === 0,

    /** Whether any filter is currently applied. */
    hasActiveFilters: (state) => state.search.trim() !== '' || state.category !== null,

    /** Flattened for the templates: one state, two readable flags. */
    isLoadingFirst: (state) => state.loading === 'first',
    isLoadingNext: (state) => state.loading === 'next',
  },

  actions: {
    /** Builds the query object sent to the API. */
    buildQuery() {
      return {
        search: this.search.trim() || undefined,
        category: this.category || undefined,
        sort: this.sort,
        page: this.page,
        limit: DEFAULT_LIMIT,
      }
    },

    /** Loads the next page and appends the results. */
    async loadNextPage() {
      // One request at a time: appending while the first page is being replaced
      // would race with it (the list is momentarily empty and `total` still
      // holds the value of the previous filters).
      if (this.loading !== 'idle' || !this.hasMore) return

      this.loading = 'next'
      this.errorNext = null
      try {
        this.page += 1
        const res = await getProfessionals(this.buildQuery())
        this.items = [...this.items, ...res.items]
        this.total = res.total
      } catch {
        this.page -= 1
        this.errorNext = 'Não foi possível carregar mais profissionais.'
      } finally {
        this.loading = 'idle'
      }
    },

    /** Loads a single professional by id into `professional`. */
    async loadById(id: string) {
      this.loading = 'detail'
      this.errorById = null
      try {
        this.professional = await getProfessionalById(id)
      } catch {
        this.professional = null
        this.errorById = 'Profissional não encontrado.'
      } finally {
        this.loading = 'idle'
      }
    },

    /** Signature of the current filters, independent of pagination. */
    buildSignature() {
      return `${this.search.trim()}|${this.category || ''}|${this.sort}`
    },

    /**
     * Loads the first page for the current filters.
     *
     * Re-requests only when the filters changed (or `force` is set), so the
     * items survive a navigation away and back — which is what allows the
     * router to restore the previous scroll position on `savedPosition`.
     */
    async loadFirstPage({ force = false } = {}) {
      const signature = this.buildSignature()
      console.log('loadFirstPage', { signature, appliedSignature: this.appliedSignature })
      if (!force && signature === this.appliedSignature && this.items.length > 0) return

      this.appliedSignature = signature
      this.page = 1
      this.items = []
      this.loading = 'first'
      this.errorFirst = null
      this.errorNext = null
      try {
        const res = await getProfessionals(this.buildQuery())
        this.items = res.items
        this.total = res.total
      } catch {
        this.errorFirst = 'Não foi possível carregar os profissionais. Tente novamente.'
        this.total = 0
      } finally {
        this.loading = 'idle'
      }
    },

    /** Clears all filters. */
    clearFilters() {
      this.search = ''
      this.category = null
      this.sort = DEFAULT_SORT
    },
  },
})
