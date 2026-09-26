/** The listing filter contract: the single place that knows the listing's query params. */
import { DEFAULT_SORT, isProfessionalCategory, isSortOption } from '@/constants/professional'
import type { ProfessionalCategory, SortOption } from '@/types/professional'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

export interface ListingFilters {
  search: string
  category: ProfessionalCategory | null
  sort: SortOption
}

/** Canonical form: `search` is trimmed once, so request, URL and fetch identity agree. */
export function listingFiltersOf(source: ListingFilters): ListingFilters {
  return { search: source.search.trim(), category: source.category, sort: source.sort }
}

/** Compares filters by value. */
export function sameFilters(a: ListingFilters, b: ListingFilters): boolean {
  return a.search === b.search && a.category === b.category && a.sort === b.sort
}

/** Identity of a fetch: the normalized filters as a single string. */
export function filterKey(filters: ListingFilters): string {
  return `${filters.search}|${filters.category ?? ''}|${filters.sort}`
}

/** Builds the filters from a route query, falling back to the defaults. */
export function parseListingFilters(query: LocationQuery): ListingFilters {
  const { search, category, sort } = query
  return {
    search: typeof search === 'string' ? search.trim() : '',
    category: isProfessionalCategory(category) ? category : null,
    sort: isSortOption(sort) ? sort : DEFAULT_SORT,
  }
}

/** Serializes the filters into a route query (default values omitted). */
export function serializeListingFilters(filters: ListingFilters): LocationQueryRaw {
  return {
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.sort !== DEFAULT_SORT ? { sort: filters.sort } : {}),
  }
}

/** Whether `query` already expresses exactly these filters (leftovers count as a mismatch). */
export function queryMatchesFilters(query: LocationQuery, filters: ListingFilters): boolean {
  const serialized = serializeListingFilters(filters)
  return (
    sameFilters(parseListingFilters(query), filters) &&
    Object.keys(query).every((key) => key in serialized)
  )
}
