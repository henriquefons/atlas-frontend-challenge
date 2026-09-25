/**
 * Professionals store (Options API).
 *
 * Owns the reactive state for the listing (items, pagination, filters) and
 * orchestrates calls to the API service. Components never call the service
 * directly — they read from this store.
 */
import { DEFAULT_LIMIT, DEFAULT_SORT } from '@/constants/professional'
import { getProfessionals } from '@/services/professionals'
import type { Professional, ProfessionalCategory, SortOption } from '@/types/professional'

interface ProfessionalsState {
  items: Professional[]
  total: number
  page: number
  limit: number
  loading: boolean
  loadingMore: boolean
  error: string | null
  search: string
  category: ProfessionalCategory | null
  sort: SortOption
}

export const useProfessionalsStore = defineStore('professionals', {
  state: (): ProfessionalsState => ({
    items: [],
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    loading: false,
    loadingMore: false,
    error: null,
    // filters
    search: '',
    category: null,
    sort: DEFAULT_SORT,
  }),

  getters: {
    /** Whether there are more pages to load. */
    hasMore: (state) => state.items.length < state.total,

    /** Whether the listing is empty (and not loading/erroring). */
    isEmpty: (state) => !state.loading && !state.error && state.items.length === 0,

    /** Whether any filter is currently applied. */
    hasActiveFilters: (state) => state.search.trim() !== '' || state.category !== null,
  },

  actions: {
    /** Builds the query object sent to the API. */
    buildQuery() {
      return {
        search: this.search.trim() || undefined,
        category: this.category ?? undefined,
        sort: this.sort,
        page: this.page,
        limit: this.limit,
      }
    },

    /** Loads the first page, replacing the current items. */
    async getProfessionals() {
      this.loading = true
      this.error = null
      try {
        const res = await getProfessionals(this.buildQuery())
        this.items = res.items
        this.total = res.total
      } catch {
        this.error = 'Não foi possível carregar os profissionais. Tente novamente.'
        this.items = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    /** Loads the next page and appends the results. */
    async getMoreProfessionals() {
      if (this.loadingMore || !this.hasMore) return
      this.loadingMore = true
      this.error = null
      try {
        this.page += 1
        const res = await getProfessionals(this.buildQuery())
        this.items = [...this.items, ...res.items]
        this.total = res.total
      } catch {
        this.page -= 1
        this.error = 'Não foi possível carregar mais profissionais.'
      } finally {
        this.loadingMore = false
      }
    },

    /** Resets pagination and reloads from the first page. */
    async reset() {
      this.page = 1
      this.items = []
      await this.getProfessionals()
    },

    /** Updates a filter and reloads from the first page. */
    async setFilter(
      key: 'search' | 'category' | 'sort',
      value: string | ProfessionalCategory | SortOption | null,
    ) {
      if (key === 'search') this.search = value as string
      else if (key === 'category') this.category = value as ProfessionalCategory | null
      else this.sort = value as SortOption
      await this.reset()
    },

    /** Clears all filters and reloads. */
    async clearFilters() {
      this.search = ''
      this.category = null
      this.sort = DEFAULT_SORT
      await this.reset()
    },
  },
})
