import type { Professional, ProfessionalsResponse, SortOption } from '@/types/professional'
import professionals from '#data/professionals.json'

const SORTABLE: Record<SortOption, (a: Professional, b: Professional) => number> = {
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  distance: (a, b) => a.distanceKm - b.distanceKm,
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Paginated listing of professionals.
 *
 * Query params:
 * - search: search by name or profession (case/accents-insensitive)
 * - category: filter by exact category
 * - sort: price_asc | price_desc | rating | distance
 * - page: page number (1-based)
 * - limit: items per page (max. 100)
 */
export default defineEventHandler((event): ProfessionalsResponse => {
  const query = getQuery(event)

  const search = String(query.search ?? '')
    .trim()
    .toLowerCase()
  const category = query.category ? String(query.category) : undefined
  const sort = (query.sort as SortOption | undefined) ?? undefined
  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(String(query.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
  )

  let items = professionals as Professional[]

  if (category) {
    items = items.filter((item) => item.category === category)
  }

  if (search) {
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(search) || item.profession.toLowerCase().includes(search),
    )
  }

  if (sort && SORTABLE[sort]) {
    items = [...items].sort(SORTABLE[sort])
  }

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const paginated = items.slice(start, start + limit)

  return {
    items: paginated,
    total,
    page,
    limit,
    totalPages,
  }
})
