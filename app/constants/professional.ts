/**
 * Centralized domain constants for the professionals catalog.
 *
 * Single source of truth for categories and sort options, so the UI, the
 * store and the URL parsing all stay in sync. Auto-imported by Nuxt.
 */
import type { ProfessionalCategory, SortOption } from '@/types/professional'

/** All categories available in the catalog. */
export const PROFESSIONAL_CATEGORIES: ProfessionalCategory[] = [
  'Serviços Domésticos',
  'Construção e Reforma',
  'Tecnologia',
  'Saúde e Bem-estar',
  'Beleza e Estética',
  'Educação',
  'Eventos',
  'Automotivo',
]

/** Default sort applied when none is provided. */
export const DEFAULT_SORT: SortOption = 'rating'

/** Default number of items per page. */
export const DEFAULT_LIMIT = 20

/** Maximum number of items per page accepted by the API. */
export const MAX_LIMIT = 100

/** Sort options with their display labels. */
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'distance', label: 'Mais próximos' },
]

/** Valid sort values, derived from SORT_OPTIONS. */
export const SORT_VALUES: SortOption[] = SORT_OPTIONS.map((option) => option.value)

/** Type guard: checks whether a value is a valid category. */
export function isProfessionalCategory(value: unknown): value is ProfessionalCategory {
  return (
    typeof value === 'string' && PROFESSIONAL_CATEGORIES.includes(value as ProfessionalCategory)
  )
}

/** Type guard: checks whether a value is a valid sort option. */
export function isSortOption(value: unknown): value is SortOption {
  return typeof value === 'string' && SORT_VALUES.includes(value as SortOption)
}
