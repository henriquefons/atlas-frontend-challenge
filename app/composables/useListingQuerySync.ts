/**
 * Two-way sync between the listing filters (store) and the URL query.
 *
 * The store is the source of truth while the user types/selects; the URL is
 * written on the next real change (`replace`, so the back button is not
 * spammed with filter history) and read back on every navigation.
 *
 * `syncFromUrl` must be called from inside `useAsyncData` so it also runs on
 * the server, where it seeds the store with the filters of the request.
 */
export function useListingQuerySync() {
  const store = useProfessionalsStore()
  const route = useRoute()
  const router = useRouter()

  /** Copies the URL query into the store. */
  function syncFromUrl() {
    const { search, category, sort } = parseListingFilters(route.query)
    store.search = search
    store.category = category
    store.sort = sort
  }

  // Store -> URL. A real filter change rebuilds the list from the top: Nuxt
  // keeps the scroll on same-path query changes, so scroll explicitly. A
  // change that already matches the URL (back/forward, initial load) returns
  // early, which leaves the restored `savedPosition` alone.
  watch(
    () => listingFiltersOf(store),
    async (filters) => {
      if (!import.meta.client) return
      if (queryMatchesFilters(route.query, filters)) return
      await router.replace({ query: serializeListingFilters(filters) })
      window.scrollTo({ top: 0, behavior: 'auto' })
    },
  )

  return { syncFromUrl }
}
