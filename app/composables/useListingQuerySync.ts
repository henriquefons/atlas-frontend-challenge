/**
 * Two-way sync between the listing filters (store) and the URL query.
 */
import { watch } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import {
  listingFiltersOf,
  parseListingFilters,
  queryMatchesFilters,
  serializeListingFilters,
  type ListingFilters,
} from '@/utils/listingFilters'

export function useListingQuerySync(
  store: ListingFilters = useProfessionalsStore(),
  route: { query: LocationQuery } = useRoute(),
  router: { replace: (to: { query: LocationQueryRaw }) => unknown } = useRouter(),
) {
  /** URL query -> store. Call inside `useAsyncData` so it also runs on the server. */
  function syncFromUrl() {
    const { search, category, sort } = parseListingFilters(route.query)
    store.search = search
    store.category = category
    store.sort = sort
  }

  // Store -> URL with `replace` (no history spam). A change that already matches
  // the URL (back/forward, initial load) returns early and keeps the scroll.
  watch(
    () => listingFiltersOf(store),
    async (filters) => {
      if (!import.meta.client) return
      if (queryMatchesFilters(route.query, filters)) return
      await router.replace({ query: serializeListingFilters(filters) })
      // A real filter change rebuilds the list from the top.
      window.scrollTo({ top: 0, behavior: 'auto' })
    },
  )

  return { syncFromUrl }
}
