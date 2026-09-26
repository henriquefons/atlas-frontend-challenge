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

interface ProfessionalsState {
  // --- listing ---
  items: Professional[]
  total: number
  page: number
  limit: number
  search: string
  category: ProfessionalCategory | null
  sort: SortOption

  // --- detail ---
  professional: Professional | null

  // --- status ---
  loadingProfessionals: boolean
  loadingMore: boolean
  loadingById: boolean
  errorProfessionals: string | null
  errorById: string | null
}

export const useProfessionalsStore = defineStore('professionals', {
  state: (): ProfessionalsState => ({
    // listing
    items: [],
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    search: '',
    category: null,
    sort: DEFAULT_SORT,

    // detail
    professional: null,

    // status
    loadingProfessionals: false,
    loadingMore: false,
    loadingById: false,
    errorProfessionals: null,
    errorById: null,
  }),

  getters: {
    /** Whether there are more pages to load. */
    hasMore: (state) => state.items.length < state.total,

    /** Whether the listing is empty (and not loading/erroring). */
    isEmpty: (state) =>
      !state.loadingProfessionals && !state.errorProfessionals && state.items.length === 0,

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
      this.loadingProfessionals = true
      this.errorProfessionals = null
      try {
        const res = await getProfessionals(this.buildQuery())
        this.items = res.items
        this.total = res.total
      } catch {
        this.errorProfessionals = 'Não foi possível carregar os profissionais. Tente novamente.'
        this.items = []
        this.total = 0
      } finally {
        this.loadingProfessionals = false
      }
    },

    /** Loads the next page and appends the results. */
    async getMoreProfessionals() {
      if (this.loadingMore || !this.hasMore) return
      this.loadingMore = true
      this.errorProfessionals = null
      try {
        this.page += 1
        const res = await getProfessionals(this.buildQuery())
        this.items = [...this.items, ...res.items]
        this.total = res.total
      } catch {
        this.page -= 1
        this.errorProfessionals = 'Não foi possível carregar mais profissionais.'
      } finally {
        this.loadingMore = false
      }
    },

    /** Loads a single professional by id into `professional`. */
    async getProfessionalById(id: string) {
      this.loadingById = true
      this.errorById = null
      try {
        this.professional = await getProfessionalById(id)
      } catch {
        this.professional = null
        this.errorById = 'Profissional não encontrado.'
      } finally {
        this.loadingById = false
      }
    },

    /** Resets pagination and reloads from the first page. */
    async reset() {
      this.page = 1
      this.items = []
      await this.getProfessionals()
    },

    /** Updates a filter. */
    setFilter(
      key: 'search' | 'category' | 'sort',
      value: string | ProfessionalCategory | SortOption | null,
    ) {
      if (key === 'search') this.search = value as string
      else if (key === 'category') this.category = value as ProfessionalCategory | null
      else this.sort = value as SortOption
    },

    /** Clears all filters.*/
    clearFilters() {
      this.search = ''
      this.category = null
      this.sort = DEFAULT_SORT
    },
  },
})
