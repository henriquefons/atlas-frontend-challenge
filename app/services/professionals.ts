/**
 * Professionals API service.
 *
 * Pure API functions (no state). They are consumed exclusively by the
 * Pinia stores, which own the reactive state and orchestration.
 */
import type { Professional, ProfessionalsQuery, ProfessionalsResponse } from '@/types/professional'

/** Fetches a paginated, filtered and sorted list of professionals. */
export function getProfessionals(query: ProfessionalsQuery = {}) {
  return $fetch<ProfessionalsResponse>('/api/professionals', { query })
}

/** Fetches a single professional by id. */
export function getProfessionalById(id: string) {
  return $fetch<Professional>(`/api/professionals/${id}`)
}
