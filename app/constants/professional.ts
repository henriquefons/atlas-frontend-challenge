/** Domain constants for the catalog: categories, sort options and pagination limits. */
import type { ProfessionalCategory, SortOption } from '@/types/professional'

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

export const DEFAULT_SORT: SortOption = 'rating'

export const DEFAULT_LIMIT = 20

export const MAX_LIMIT = 100

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'distance', label: 'Mais próximos' },
]

/** Derived from SORT_OPTIONS. */
const SORT_VALUES: SortOption[] = SORT_OPTIONS.map((option) => option.value)

/** Value guards for the values that come from the URL. */
export function isProfessionalCategory(value: unknown): value is ProfessionalCategory {
  return (
    typeof value === 'string' && PROFESSIONAL_CATEGORIES.includes(value as ProfessionalCategory)
  )
}

export function isSortOption(value: unknown): value is SortOption {
  return typeof value === 'string' && SORT_VALUES.includes(value as SortOption)
}
