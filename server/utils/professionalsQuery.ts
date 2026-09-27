/**
 * Listing query pipeline of `GET /api/professionals`, kept free of Nitro/h3
 * types so it can be unit tested directly (see `test/unit/server/`).
 */
import { DEFAULT_LIMIT, MAX_LIMIT } from '@/constants/professional'
import type { Professional, ProfessionalsResponse, SortOption } from '@/types/professional'
import { normalizeText } from './normalizeText'

/** Sort comparators, keyed by the `sort` query param. */
const SORTABLE: Record<SortOption, (a: Professional, b: Professional) => number> = {
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  distance: (a, b) => a.distanceKm - b.distanceKm,
}

export interface ProfessionalsQuery {
  /** Raw `search` param, already trimmed. */
  search: string
  /** Raw `category` param, when present. */
  category?: string
  /** Validated `sort` param; unknown values are dropped. */
  sort?: SortOption
  page: number
  limit: number
}

/** Whether a professional matches the search term (name or profession). */
export function matchesSearch(professional: Professional, search: string): boolean {
  const needle = normalizeText(search.trim())
  if (!needle) return true

  return (
    normalizeText(professional.name).includes(needle) ||
    normalizeText(professional.profession).includes(needle)
  )
}

/**
 * Parses and clamps the raw query string values. Invalid numbers fall back to
 * the defaults, `limit` never exceeds `MAX_LIMIT` and `page` never goes below 1.
 */
export function parseProfessionalsQuery(query: Record<string, unknown> = {}): ProfessionalsQuery {
  const sort = query.sort ? String(query.sort) : ''
  const page = Number.parseInt(String(query.page || ''), 10)
  const limit = Number.parseInt(String(query.limit || ''), 10)

  return {
    search: String(query.search || '').trim(),
    category: query.category ? String(query.category) : undefined,
    sort: sort in SORTABLE ? (sort as SortOption) : undefined,
    page: Math.max(1, page || 1),
    limit: Math.min(MAX_LIMIT, Math.max(1, limit || DEFAULT_LIMIT)),
  }
}

/** Filters by category and/or search, then sorts (never mutates the input). */
function filterAndSortProfessionals(
  items: readonly Professional[],
  { search, category, sort }: Pick<ProfessionalsQuery, 'search' | 'category' | 'sort'>,
): Professional[] {
  let result = [...items]

  if (category) {
    result = result.filter((item) => item.category === category)
  }

  if (search) {
    result = result.filter((item) => matchesSearch(item, search))
  }

  return sort ? result.sort(SORTABLE[sort]) : result
}

/** Applies the parsed query to the dataset and builds the paginated response. */
export function queryProfessionals(
  items: readonly Professional[],
  query: ProfessionalsQuery,
): ProfessionalsResponse {
  const filtered = filterAndSortProfessionals(items, query)
  const total = filtered.length
  const start = (query.page - 1) * query.limit

  return {
    items: filtered.slice(start, start + query.limit),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  }
}
