/**
 * The listing filter contract.
 *
 * Single place that knows which query params describe the listing, so the
 * store, the page and the URL stay in sync when a filter is added.
 */
import { DEFAULT_SORT, isProfessionalCategory, isSortOption } from '@/constants/professional'
import type { ProfessionalCategory, SortOption } from '@/types/professional'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

/** Filters that describe a listing query. */
export interface ListingFilters {
  search: string
  category: ProfessionalCategory | null
  sort: SortOption
}

/** Reads the filters out of any compatible source (e.g. the store). */
export function listingFiltersOf(source: ListingFilters): ListingFilters {
  return { search: source.search, category: source.category, sort: source.sort }
}

/** Builds the filters from a route query, falling back to the defaults. */
export function parseListingFilters(query: LocationQuery): ListingFilters {
  const { search, category, sort } = query
  return {
    search: typeof search === 'string' ? search : '',
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

/**
 * Whether the filter part of `query` already matches `filters`. Unknown params
 * count as a mismatch, so the URL gets normalized once.
 */
export function queryMatchesFilters(query: LocationQuery, filters: ListingFilters): boolean {
  const serialized = serializeListingFilters(filters)
  const keys = new Set([...Object.keys(serialized), ...Object.keys(query)])
  return [...keys].every((key) => {
    const current = (serialized as Record<string, unknown>)[key]
    const next = query[key]
    return (current || '') === (next || '')
  })
}
