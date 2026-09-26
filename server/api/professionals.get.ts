import type { Professional, ProfessionalsResponse } from '@/types/professional'
import professionals from '#data/professionals.json'
import { parseProfessionalsQuery, queryProfessionals } from '../utils/professionalsQuery'

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
export default defineEventHandler(async (event): Promise<ProfessionalsResponse> => {
  await simulateApiLatency()

  return queryProfessionals(
    professionals as Professional[],
    parseProfessionalsQuery(getQuery(event)),
  )
})
