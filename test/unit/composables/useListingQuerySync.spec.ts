import { flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useListingQuerySync } from '@/composables/useListingQuerySync'
import type { ListingFilters } from '@/utils/listingFilters'

const DEFAULTS: ListingFilters = { search: '', category: null, sort: 'rating' }

/**
 * Stand-ins for the Nuxt/router dependencies: the composable only reads `query`
 * from the route and only calls `replace` on the router.
 */
function createHarness(query: Record<string, string> = {}, initial: Partial<ListingFilters> = {}) {
  const store = reactive<ListingFilters>({ ...DEFAULTS, ...initial })
  const route = { query }
  const router = { replace: vi.fn(async () => {}) }

  const { syncFromUrl } = useListingQuerySync(store, route, router)

  return { store, router, syncFromUrl }
}

const scrollTo = vi.fn()

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(scrollTo)
})

afterEach(() => {
  vi.restoreAllMocks()
  scrollTo.mockClear()
})

describe('useListingQuerySync - URL to store', () => {
  it('copies the query into the store, normalized', () => {
    const { store, syncFromUrl } = createHarness({
      search: '  ana  ',
      category: 'Tecnologia',
      sort: 'price_asc',
    })

    syncFromUrl()

    expect({ ...store }).toEqual({ search: 'ana', category: 'Tecnologia', sort: 'price_asc' })
  })

  it('makes the URL the source of truth, clearing filters the store still holds', () => {
    const { store, syncFromUrl } = createHarness(
      {},
      { search: 'ana', category: 'Tecnologia', sort: 'price_asc' },
    )

    syncFromUrl()

    expect({ ...store }).toEqual(DEFAULTS)
  })
})

describe('useListingQuerySync - store to URL', () => {
  it('writes the query and returns to the top when a filter changes', async () => {
    const { store, router } = createHarness()

    store.category = 'Tecnologia'
    await flushPromises()

    expect(router.replace).toHaveBeenCalledTimes(1)
    expect(router.replace).toHaveBeenCalledWith({ query: { category: 'Tecnologia' } })
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('leaves the URL and the scroll alone when the change came from the URL itself', async () => {
    // Initial load and back/forward fill the store from the URL: rewriting the URL
    // here would drop `savedPosition` and lose the scroll restoration.
    const { router, syncFromUrl } = createHarness({ category: 'Tecnologia' })

    syncFromUrl()
    await flushPromises()

    expect(router.replace).not.toHaveBeenCalled()
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
