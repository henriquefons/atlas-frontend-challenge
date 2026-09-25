/**
 * Data model for the professionals catalog.
 *
 * Data is generated deterministically by `scripts/generate-data.mjs`
 * (Faker.js with a fixed seed) and served by the mock layer in `server/api`.
 */

/** Categories available in the catalog. */
export type ProfessionalCategory =
  | 'Serviços Domésticos'
  | 'Construção e Reforma'
  | 'Tecnologia'
  | 'Saúde e Bem-estar'
  | 'Beleza e Estética'
  | 'Educação'
  | 'Eventos'
  | 'Automotivo'

/** Sorting options supported by the listing. */
export type SortOption = 'price_asc' | 'price_desc' | 'rating' | 'distance'

/** Professional displayed in the catalog. */
export interface Professional {
  id: string
  name: string
  profession: string
  category: ProfessionalCategory
  avatarUrl: string | null
  price: number
  rating: number
  distanceKm: number
  city: string
  description: string
  services: string[]
  availability: string[]
}

/** Paginated response for the professionals listing. */
export interface ProfessionalsResponse {
  items: Professional[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** Parameters accepted by the listing. */
export interface ProfessionalsQuery {
  search?: string
  category?: ProfessionalCategory
  sort?: SortOption
  page?: number
  limit?: number
}
