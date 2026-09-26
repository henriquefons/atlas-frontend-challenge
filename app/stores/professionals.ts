/** Listing + detail state. Components read from here; only this store calls the API service. */
import { defineStore } from 'pinia'
import { DEFAULT_LIMIT, DEFAULT_SORT } from '@/constants/professional'
import { getProfessionalById, getProfessionals } from '@/services/professionals'
import type { Professional, ProfessionalCategory, SortOption } from '@/types/professional'
import { filterKey, listingFiltersOf } from '@/utils/listingFilters'

/** One request in flight at a time, so the guards cannot conflict. */
type LoadingState = 'idle' | 'first' | 'next' | 'detail'

interface ProfessionalsState {
  // --- listing ---
  items: Professional[]
  total: number
  page: number
  search: string
  category: ProfessionalCategory | null
  sort: SortOption
  /** `filterKey` of the filters whose results are currently loaded. */
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
    hasMore: (state) => state.items.length < state.total,

    /** Empty, not loading and not failed. */
    isEmpty: (state) => state.loading !== 'first' && !state.errorFirst && state.items.length === 0,

    hasActiveFilters: (state) => state.search.trim() !== '' || state.category !== null,

    /** One state, two flags for the templates. */
    isLoadingFirst: (state) => state.loading === 'first',
    isLoadingNext: (state) => state.loading === 'next',
  },

  actions: {
    buildQuery() {
      return {
        search: this.search.trim() || undefined,
        category: this.category || undefined,
        sort: this.sort,
        page: this.page,
        limit: DEFAULT_LIMIT,
      }
    },

    async loadNextPage() {
      // Appending while page 1 is being replaced would race with it.
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

    /**
     * Loads page 1. Same filters => no request (unless `force`), so the items
     * (and the restored scroll) survive a round trip to a profile.
     */
    async loadFirstPage({ force = false } = {}) {
      const key = filterKey(listingFiltersOf(this))
      if (!force && key === this.appliedSignature && this.items.length > 0) return

      this.appliedSignature = key
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

    clearFilters() {
      this.search = ''
      this.category = null
      this.sort = DEFAULT_SORT
    },
  },
})
