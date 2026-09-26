/** API calls for the catalog; the reactive state lives in the stores. */
import type { Professional, ProfessionalsQuery, ProfessionalsResponse } from '@/types/professional'

/** Paginated, filtered and sorted listing. */
export function getProfessionals(query: ProfessionalsQuery = {}) {
  return $fetch<ProfessionalsResponse>('/api/professionals', { query })
}

export function getProfessionalById(id: string) {
  return $fetch<Professional>(`/api/professionals/${id}`)
}
